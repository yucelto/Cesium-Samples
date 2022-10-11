//Open Your tileset with sandcastle and copy paste all code

var scene = viewer.scene;
if (!scene.pickPositionSupported) {
  console.log("This browser does not support pickPosition.");
}

viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
  var pickedFeature = viewer.scene.pick(movement.position);
  if (!Cesium.defined(pickedFeature)) {
    // nothing picked
    return;
  }
  var worldPosition = viewer.scene.pickPosition(movement.position);
  var cartoposition = Cesium.Cartographic.fromCartesian(worldPosition);
  console.log(
    "Longitude: " +
      Cesium.Math.toDegrees(cartoposition.longitude).toFixed(7) +
      "  Latitude: " +
      Cesium.Math.toDegrees(cartoposition.latitude).toFixed(7) +
      " Ellipsoidal Height: " +
      cartoposition.height.toFixed(2)
  );
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
handler.setInputAction(function (event) {
  var position = viewer.scene.pickPosition(event.position);
  if (Cesium.defined(position)) {
    var carto = Cesium.Cartographic.fromCartesian(position);
    var lat = Cesium.Math.toDegrees(carto.latitude);
    var lon = Cesium.Math.toDegrees(carto.longitude);
    console.log("Getting sample...");
    var promise = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [
      carto,
    ]);
    promise.then(function (updatedPositions) {
      console.log(
        "Lon " + lon + "\nLat" + lat + "\nHeight " + updatedPositions[0].height
      );
    });
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
