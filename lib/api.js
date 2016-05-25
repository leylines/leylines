"use strict";

var express = require('express');
var czml = require('./createCzml');
var leylines = require('./leylines');
var grid = require('./createGrid');
var Math = require('./Math');

module.exports = function(options) {

  var pgConnectionString = options.pgConnectionString || [];

  // routes for postgis api
  var router = express.Router();    // get an instance of the express Router

  router.get('/megalithic/:type', function(req, res) {
      leylines.createMegalithic(req, res, pgConnectionString);
  });
  router.get('/montelius/:country', function(req, res) {
      leylines.createMontelius(req, res, pgConnectionString);
  });
  router.get('/points/:schema/:table/:icon', function(req, res) {
      leylines.createPOI(req, res, pgConnectionString);
  });
  router.get('/beckerhagens/:type/:level', function(req, res) {
      leylines.createBeckerHagens(req, res);
  });
  router.get('/createGridCoords/:lat1/:lon1/:lat2/:lon2/:shape/:type', function(req, res) {
      leylines.createGridCoords(req, res);
  });
  router.get('/createGridAzi/:lat1/:lon1/:azi/:shape/:type', function(req, res) {
      leylines.createGridAzi(req, res);
  });
  router.get('/createGridArea/:lat1/:lon1/:azi/:shape/:type', function(req, res) {
      leylines.createGridArea(req, res);
  });
  router.get('/createGridAreas/:schema/:table/:icon', function(req, res) {
      leylines.createGridAreas(req, res, pgConnectionString);
  });
  router.get('/createGridLines/:lat1/:lon1/:azi/:shape/:type', function(req, res) {
      leylines.createGridLines(req, res);
  });
  router.get('/createGridPoints/:lat1/:lon1/:azi/:shape/:type', function(req, res) {
      leylines.createGridPoints(req, res);
  });
  router.get('/countries/:country', function(req, res) {
      leylines.createCountry(req, res, pgConnectionString);
  });
  router.get('/areas/:schema/:table/:name', function(req, res) {
      leylines.createArea(req, res, pgConnectionString);
  });
  router.get('/line/:schema/:table/:width/:color', function(req, res) {
      leylines.createLine(req, res, pgConnectionString);
  });
  router.get('/volcanos/:table/:icon', function(req, res) {
      leylines.createVolcano(req, res, pgConnectionString);
  });
  router.get('/poles/:table/:icon', function(req, res) {
      leylines.createPole(req, res, pgConnectionString);
  });

    return router;
};
//module.exports = router(options);

