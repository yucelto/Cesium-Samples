// Currently if you try to add a geojson file into your map, that assest stand on both 3D Tiles and Terrain
// Check below to fix this issue

(async () => {
  try {
    const resource = await Cesium.IonResource.fromAssetId(assedId);
    const dataSource = await Cesium.GeoJsonDataSource.load(resource, {
      //add potions here!
      clampToGround: true,
    });
    await viewer.dataSources.add(dataSource);
    // add this part to separate geojson from 3D Tiles!
    dataSource.entities.values.forEach((entity) => {
      entity.polygon.classificationType = new Cesium.ConstantProperty(
        Cesium.ClassificationType.TERRAIN
      );
    });
    await viewer.zoomTo(dataSource);
  } catch (error) {
    console.log(error);
  }
})();
