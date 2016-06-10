'use strict';

/*global require*/
var BaseMapViewModel = require('./BaseMapViewModel');
var BingMapsCatalogItem = require('../Models/BingMapsCatalogItem');
var WebMapServiceCatalogItem = require('../Models/WebMapServiceCatalogItem');
var OpenStreetMapCatalogItem = require('../Models/OpenStreetMapCatalogItem');
var ArcGisMapServerCatalogItem = require('../Models/ArcGisMapServerCatalogItem');
var MapboxMapCatalogItem = require('../Models/MapboxMapCatalogItem');

var BingMapsStyle = require('terriajs-cesium/Source/Scene/BingMapsStyle');

var createGlobalBaseMapOptions = function(terria, bingMapsKey, digitalGlobeApiKey) {

    var result = [];

    var bingMapsAerialWithLabels = new BingMapsCatalogItem(terria);
    bingMapsAerialWithLabels.name = 'Bing Maps Aerial with Labels';
    bingMapsAerialWithLabels.mapStyle = BingMapsStyle.AERIAL_WITH_LABELS;
    bingMapsAerialWithLabels.opacity = 1.0;
    bingMapsAerialWithLabels.key = bingMapsKey;
    bingMapsAerialWithLabels.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/bingAerialLabels.png',
        catalogItem: bingMapsAerialWithLabels
    }));

    var bingMapsAerial = new BingMapsCatalogItem(terria);
    bingMapsAerial.name = 'Bing Maps Aerial';
    bingMapsAerial.mapStyle = BingMapsStyle.AERIAL;
    bingMapsAerial.opacity = 1.0;
    bingMapsAerial.key = bingMapsKey;
    bingMapsAerial.isRequiredForRendering = true;
    bingMapsAerial.requestWaterMask = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/bingAerial.png',
        catalogItem: bingMapsAerial
    }));

    var bingMapsRoads = new BingMapsCatalogItem(terria);
    bingMapsRoads.name = 'Bing Maps Roads';
    bingMapsRoads.mapStyle = BingMapsStyle.ROAD;
    bingMapsRoads.opacity = 1.0;
    bingMapsRoads.key = bingMapsKey;
    bingMapsRoads.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/bingRoads.png',
        catalogItem: bingMapsRoads
    }));

    var esriWorldImagery = new ArcGisMapServerCatalogItem(terria);
    esriWorldImagery.name = 'ESRI World Imagery';
    esriWorldImagery.url = 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
    esriWorldImagery.opacity = 1.0;
    esriWorldImagery.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/esriWorldImagery.png',
        catalogItem: esriWorldImagery
    }));

    var esriWorldTopoMap = new ArcGisMapServerCatalogItem(terria);
    esriWorldTopoMap.name = 'ESRI World Topo Map';
    esriWorldTopoMap.url = 'http://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer';
    esriWorldTopoMap.opacity = 1.0;
    esriWorldTopoMap.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/esriWorldTopoMap.png',
        catalogItem: esriWorldTopoMap
    }));

    var esriNationalGeographic = new ArcGisMapServerCatalogItem(terria);
    esriNationalGeographic.name = 'National Geographic Map';
    esriNationalGeographic.url = 'http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer';
    esriNationalGeographic.opacity = 1.0;
    esriNationalGeographic.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/esriNationalGeographic.png',
        catalogItem: esriNationalGeographic
    }));

    var openStreetMap = new OpenStreetMapCatalogItem(terria);
    openStreetMap.name = 'Open Street Map';
    openStreetMap.url = 'http://a.tile.openstreetmap.org';
    openStreetMap.opacity = 1.0;
    openStreetMap.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/openStreetMap.png',
        catalogItem: openStreetMap
    }));

    var stamenToner = new OpenStreetMapCatalogItem(terria);
    stamenToner.name = 'Stamen Toner';
    stamenToner.url = 'http://stamen-tiles.a.ssl.fastly.net/toner-lite/';
    stamenToner.opacity = 1.0;
    stamenToner.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/stamenToner.png',
        catalogItem: stamenToner
    }));

    var stamenWatercolor = new OpenStreetMapCatalogItem(terria);
    stamenWatercolor.name = 'Stamen Watercolor';
    stamenWatercolor.url = 'http://stamen-tiles.a.ssl.fastly.net/watercolor/';
    stamenWatercolor.opacity = 1.0;
    stamenWatercolor.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/stamenWatercolor.png',
        catalogItem: stamenWatercolor
    }));

    var eoxTerrain = new WebMapServiceCatalogItem(terria);
    eoxTerrain.name = 'EOX Terrain';
    eoxTerrain.url = 'http://tiles.maps.eox.at/wms';
    eoxTerrain.layers = 'terrain_3857';
    eoxTerrain.parameters = {
        tiled: true
    };
    eoxTerrain.opacity = 1.0;
    eoxTerrain.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/eoxTerrain.png',
        catalogItem: eoxTerrain
    }));

    var gebco = new WebMapServiceCatalogItem(terria);
    gebco.name = 'GEBCO Latest';
    gebco.url = 'http://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv';
    gebco.layers = 'GEBCO_LATEST';
    gebco.parameters = {
        tiled: true
    };
    gebco.opacity = 1.0;
    gebco.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/gebco.png',
        catalogItem: gebco
    }));

    var blueMarble = new WebMapServiceCatalogItem(terria);
    blueMarble.name = 'NASA Blue Marble';
    blueMarble.url = 'http://tiles.maps.eox.at/wms';
    blueMarble.layers = 'bluemarble_3857';
    blueMarble.parameters = {
        tiled: true
    };
    blueMarble.opacity = 1.0;
    blueMarble.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/blueMarble.png',
        catalogItem: blueMarble
    }));

    var digitalMap = new MapboxMapCatalogItem(terria);
    digitalMap.name = 'DigitalGlobe Maps';
    digitalMap.mapId = 'digitalglobe.nmmnloo2';
    digitalMap.credit = 'DigitalGlobe Maps API';
    digitalMap.accessToken = digitalGlobeApiKey;
    digitalMap.opacity = 1.0;
    digitalMap.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/mapBox.png',
        catalogItem: digitalMap
    }));

    var blackMarble = new WebMapServiceCatalogItem(terria);
    blackMarble.name = 'NASA Black Marble';
    blackMarble.url = 'http://tiles.maps.eox.at/wms';
    blackMarble.layers = 'blackmarble_3857';
    blackMarble.parameters = {
        tiled: true
    };
    blackMarble.opacity = 1.0;
    blackMarble.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/blackMarble.png',
        catalogItem: blackMarble
    }));

    var naturalEarthII = new WebMapServiceCatalogItem(terria);
    naturalEarthII.name = 'Natural Earth II';
    naturalEarthII.url = 'http://maps.leylines.ch:8080/geoserver/baseMaps/wms';
    naturalEarthII.layers = 'naturalEarthII';
    naturalEarthII.parameters = {
        tiled: true
    };
    naturalEarthII.opacity = 1.0;
    naturalEarthII.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images-leylines/naturalEarth.png',
        catalogItem: naturalEarthII
    }));

    return result;
};

module.exports = createGlobalBaseMapOptions;
