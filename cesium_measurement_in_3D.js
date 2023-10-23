//Add buttons to your html
{
  /* <button id="measureButton">Start measurement</button>
<button id="clearButton" style="display: none;">Clear</button> */
}
// paste code below to your app.js file

const scene = viewer.scene;
const ellipsoid = Cesium.Ellipsoid.WGS84;
const geodesic = new Cesium.EllipsoidGeodesic();

const points = scene.primitives.add(new Cesium.PointPrimitiveCollection());
let point1, point2;
let point1GeoPosition, point2GeoPosition;
const polylines = scene.primitives.add(new Cesium.PolylineCollection());
let polyline1, polyline2, polyline3;
let distanceLabel, verticalLabel, horizontalLabel;
const LINEPOINTCOLOR = Cesium.Color.RED;

const measureButton = document.getElementById("measureButton");
const clearButton = document.getElementById("clearButton");

let measuring = false;

measureButton.addEventListener("click", () => {
  if (!measuring) {
    measuring = true;
    measureButton.textContent = "Close Measurement";
    clearButton.style.display = "inline";
    points.removeAll();
    polylines.removeAll();
    viewer.entities.remove(distanceLabel);
    viewer.entities.remove(horizontalLabel);
    viewer.entities.remove(verticalLabel);
  } else {
    measuring = false;
    measureButton.textContent = "Start Measurement";
    clearButton.style.display = "none";
  }
});

clearButton.addEventListener("click", () => {
  points.removeAll();
  polylines.removeAll();
  viewer.entities.remove(distanceLabel);
  viewer.entities.remove(horizontalLabel);
  viewer.entities.remove(verticalLabel);
});

// Mouse click event
const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
handler.setInputAction(function (click) {
  if (measuring) {
    const cartesian = viewer.scene.pickPosition(click.position);
    if (Cesium.defined(cartesian)) {
      if (points.length === 0) {
        point1 = points.add({
          position: new Cesium.Cartesian3(
            cartesian.x,
            cartesian.y,
            cartesian.z
          ),
          color: LINEPOINTCOLOR,
        });
      } else if (points.length === 1) {
        point2 = points.add({
          position: new Cesium.Cartesian3(
            cartesian.x,
            cartesian.y,
            cartesian.z
          ),
          color: LINEPOINTCOLOR,
        });
        point1GeoPosition = Cesium.Cartographic.fromCartesian(point1.position);
        point2GeoPosition = Cesium.Cartographic.fromCartesian(point2.position);

        const pl1Positions = [
          Cesium.Cartesian3.fromRadians(
            point1GeoPosition.longitude,
            point1GeoPosition.latitude,
            point1GeoPosition.height
          ),
          Cesium.Cartesian3.fromRadians(
            point2GeoPosition.longitude,
            point2GeoPosition.latitude,
            point2GeoPosition.height
          ),
        ];
        const pl2Positions = [
          Cesium.Cartesian3.fromRadians(
            point2GeoPosition.longitude,
            point2GeoPosition.latitude,
            point2GeoPosition.height
          ),
          Cesium.Cartesian3.fromRadians(
            point2GeoPosition.longitude,
            point2GeoPosition.latitude,
            point1GeoPosition.height
          ),
        ];
        const pl3Positions = [
          Cesium.Cartesian3.fromRadians(
            point1GeoPosition.longitude,
            point1GeoPosition.latitude,
            point1GeoPosition.height
          ),
          Cesium.Cartesian3.fromRadians(
            point2GeoPosition.longitude,
            point2GeoPosition.latitude,
            point1GeoPosition.height
          ),
        ];

        polyline1 = polylines.add({
          show: true,
          positions: pl1Positions,
          width: 1,
          material: new Cesium.Material({
            fabric: {
              type: "Color",
              uniforms: {
                color: LINEPOINTCOLOR,
              },
            },
          }),
        });
        polyline2 = polylines.add({
          show: true,
          positions: pl2Positions,
          width: 1,
          material: new Cesium.Material({
            fabric: {
              type: "PolylineDash",
              uniforms: {
                color: LINEPOINTCOLOR,
              },
            },
          }),
        });
        polyline3 = polylines.add({
          show: true,
          positions: pl3Positions,
          width: 1,
          material: new Cesium.Material({
            fabric: {
              type: "PolylineDash",
              uniforms: {
                color: LINEPOINTCOLOR,
              },
            },
          }),
        });
        let labelZ;
        if (point2GeoPosition.height >= point1GeoPosition.height) {
          labelZ =
            point1GeoPosition.height +
            (point2GeoPosition.height - point1GeoPosition.height) / 2.0;
        } else {
          labelZ =
            point2GeoPosition.height +
            (point1GeoPosition.height - point2GeoPosition.height) / 2.0;
        }
        addDistanceLabel(point1, point2, labelZ);
      }
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

function addDistanceLabel(point1, point2, height) {
  point1.cartographic = ellipsoid.cartesianToCartographic(point1.position);
  point2.cartographic = ellipsoid.cartesianToCartographic(point2.position);
  point1.longitude = parseFloat(Cesium.Math.toDegrees(point1.position.x));
  point1.latitude = parseFloat(Cesium.Math.toDegrees(point1.position.y));
  point2.longitude = parseFloat(Cesium.Math.toDegrees(point2.position.x));
  point2.latitude = parseFloat(Cesium.Math.toDegrees(point2.position.y));

  const label = {
    font: "14px monospace",
    showBackground: true,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    pixelOffset: new Cesium.Cartesian2(0, 0),
    eyeOffset: new Cesium.Cartesian3(0, 0, -50),
    fillColor: Cesium.Color.WHITE,
  };

  label.text = getHorizontalDistanceString(point1, point2);
  horizontalLabel = viewer.entities.add({
    position: getMidpoint(point1, point2, point1GeoPosition.height),
    label: label,
  });
  label.text = getDistanceString(point1, point2);
  distanceLabel = viewer.entities.add({
    position: getMidpoint(point1, point2, height),
    label: label,
  });
  label.text = getVerticalDistanceString();
  verticalLabel = viewer.entities.add({
    position: getMidpoint(point2, point2, height),
    label: label,
  });
}

function getHorizontalDistanceString(point1, point2) {
  geodesic.setEndPoints(point1.cartographic, point2.cartographic);
  const meters = geodesic.surfaceDistance.toFixed(2);
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + " км";
  }
  return meters + " м";
}

function getVerticalDistanceString() {
  const heights = [point1GeoPosition.height, point2GeoPosition.height];
  const meters = Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + " км";
  }
  return meters.toFixed(2) + " м";
}

function getDistanceString(point1, point2) {
  geodesic.setEndPoints(point1.cartographic, point2.cartographic);
  const horizontalMeters = geodesic.surfaceDistance.toFixed(2);
  const heights = [point1GeoPosition.height, point2GeoPosition.height];
  const verticalMeters =
    Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
  const meters = Math.pow(
    Math.pow(horizontalMeters, 2) + Math.pow(verticalMeters, 2),
    0.5
  );

  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + " км";
  }
  return meters.toFixed(2) + " м";
}

function getMidpoint(point1, point2, height) {
  const scratch = new Cesium.Cartographic();
  geodesic.setEndPoints(point1.cartographic, point2.cartographic);
  const midpointCartographic = geodesic.interpolateUsingFraction(0.5, scratch);
  return Cesium.Cartesian3.fromRadians(
    midpointCartographic.longitude,
    midpointCartographic.latitude,
    height
  );
}
