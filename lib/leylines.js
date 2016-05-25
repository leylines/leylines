'use strict';

exports.createLine = function(req, res) {

	var pg = require('pg');
	var czml = require('./createCzml.js');

        //var connectionString = 'postgres://pgUser:pgPass@pgHost:pgPort/leylines';
	var schema = req.params.schema;
	var table = req.params.table;
	var maintable = schema + "." + table;
	var width = req.params.width;
	var color = req.params.color.split(",");
	var results = [];

	// Print Header
	results = czml.createHeader(results);

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done) {

		// SQL Query > Select Data
		var querystatement = "SELECT ST_AsGeoJSON(geom), name, description FROM ";
		querystatement += maintable;
		querystatement += ";";
		var query = client.query(querystatement);
		var multiline = [];
		var name = [];
		var description = [];
		var lines = 0;

		// Stream results back one row at a time
		query.on('row', function(row) {
			var multilines = JSON.parse(row.st_asgeojson);
			multiline[lines] = [];
			name[lines] = row.name;
			description[lines] = row.description;
			for (var i=0, tot=multilines.coordinates.length; i<tot; i++) {
				multiline[lines].push(multilines.coordinates[i][0]);
				multiline[lines].push(multilines.coordinates[i][1]);
				multiline[lines].push(0.0);
			}
			lines++;
		});

		// After all data is returned, close connection and return results
		query.on('end', function() {
			client.end();
			// var color = [255,178,102,196];
			var extrudeheight = 10000;
			for (var i=0, tot=multiline.length; i<tot; i++) {
				results = czml.createCorridorCarto(i, name[i], description[i], width, color, multiline[i], results);
			}
			return res.json(results);
		});

		// Handle Errors
		if(err) {
			console.log(err);
		}
	});
};

exports.createArea = function(req, res) {

	var pg = require('pg');
	var czml = require('./createCzml.js');

        var connectionString = 'postgres://leylines:leylines@localhost:5432/leylines';
	var results = [];

	// Print Header
	results = czml.createHeader(results);

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done) {

		// SQL Query > Select Data
		var maintable = req.params.schema + "." + req.params.table;
		var querystatement = "SELECT ST_AsGeoJSON(geom) FROM ";
		querystatement += maintable;
		querystatement += " WHERE name = '";
		querystatement += req.params.name;
		querystatement += "';";
		var query = client.query(querystatement);
		var polygon = [];

		// Stream results back one row at a time
		query.on('row', function(row) {
			var polygons = JSON.parse(row.st_asgeojson);
			for (var i=0, tot0=polygons.coordinates.length; i<tot0; i++) {
				polygon[i] = [];
				for (var k=0, tot2=polygons.coordinates[i][0].length; k<tot2; k++) {
					polygon[i].push(polygons.coordinates[i][0][k][0]);
					polygon[i].push(polygons.coordinates[i][0][k][1]);
					polygon[i].push(0.0);
				}
			}
		});

		// After all data is returned, close connection and return results
		query.on('end', function() {
			client.end();
			for (var i=0, tot=polygon.length; i<tot; i++) {
				var color = [255,178,102,100];
				var polygonid = i;
				var extrudeheight = 10000;
				results = czml.createPolygonCarto(polygonid, polygonid, polygonid, color, extrudeheight, polygon[i], results);
			}
			return res.json(results);
		});

		// Handle Errors
		if(err) {
			console.log(err);
		}
	});
};

exports.createGridLines = function(req, res) {

	var grid = require('./createGrid.js');
	var czml = require('./createCzml.js');
	var math = require('./Math.js');

	var results = [];
	var rowdetails = [];

	var azi = -math.radians(req.params.azi);

	czml.createHeader(results);
	rowdetails = grid.calculateGridPoints(req.params.lat1, req.params.lon1, azi, req.params.shape, req.params.type);
	grid.createLinesLevel1(rowdetails, req.params.type, results); 

	return res.json(results);
};

exports.createGridPoints = function(req, res) {

	var grid = require('./createGrid.js');
	var czml = require('./createCzml.js');
	var math = require('./Math.js');

	var results = [];
	var rowdetails = [];

	var azi = -math.radians(req.params.azi);

	czml.createHeader(results);
	rowdetails = grid.calculateGridPoints(req.params.lat1, req.params.lon1, azi, req.params.shape, req.params.type);
	grid.createPoints(rowdetails, results); 

	return res.json(results);
};

exports.createGridAreas = function(req, res) {

	var pg = require('pg');
	var czml = require('./createCzml.js');
        var connectionString = 'postgres://leylines:leylines@localhost:5432/leylines';
	var results = [];

	// Print Header
	results = czml.createHeader(results);

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done) {

		var maintable = req.params.schema + "." + req.params.table;
		var typetable = "object_types";
		var subtypetable = "object_sub_types";
		//var pointcoords = [];

		// SQL Query > Select Data
		var querystatement = "SELECT " + maintable + ".gid,";
		querystatement += maintable + ".site,";
		querystatement += maintable + ".description,";
		querystatement += maintable + ".x_coord,";
		querystatement += maintable + ".y_coord,";
		querystatement += maintable + ".z_coord,";
		querystatement += maintable + ".country";
		querystatement += " FROM ";
		querystatement += maintable;
		querystatement += ";";
		//console.log(querystatement);
		var query = client.query(querystatement);

		// Stream results back one row at a time
		query.on('row', function(row) {
			var icon = "";
			if (!row.description) {
				row.description = row.site;
			}
			if (row.description == 'Female') {
				icon = "/images/button_blue.png";
			} else if (row.description == 'Male') {
				icon = "/images/button_red.png";
			} else {
				icon = "/images/button_green.png";
			}
			var scale = 0.2;
			var description = "<!--HTML-->\r\n<p>\r\n";
			description += row.description;
			description += "\r\n</p>";
			results = czml.createPoint(row.gid, row.site, description, icon, scale, row.x_coord, row.y_coord, row.z_coord, results);
		});

		// After all data is returned, close connection and return results
		query.on('end', function() {
			client.end();

			var polygon = [];
			var polygonid;
			var color = [];
			var extrudeheight = 10000;
			var polygonreference = [];

			// Africa
			color = [0, 255, 0, 64];

			polygon = [20, 51, 59];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [38, 43, 32];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [51, 43, 28];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [24, 43, 59];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			color = [153, 255, 153, 64];

			polygon = [38, 31, 32];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [43, 32, 28];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [51, 43, 59];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [24, 38, 43];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);


			// Asia
			color = [153, 51, 255, 64];

			polygon = [44, 42, 27];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [42, 50, 58];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [32, 28, 42];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [31, 32, 44];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			color = [204, 153, 255, 64];

			polygon = [50, 58, 22];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [42, 27, 58];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [28, 42, 50];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [32, 44, 42];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			// Antlantis
			color = [255, 128, 0, 64];

			polygon = [26, 61, 36];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [54, 46, 38];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [36, 54, 24];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [61, 23, 54];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			color = [255, 178, 102, 64];

			polygon = [46, 38, 31];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [54, 24, 38];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [61, 36, 54];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [23, 54, 46];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			// North America
			color = [0, 0, 255, 64];

			polygon = [31, 46, 52];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [52, 34, 21];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [23, 34, 46];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [53, 34, 49];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			color = [102, 102, 255, 64];

			polygon = [29, 53, 49];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [34, 46, 52];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [23, 53, 34];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [49, 34, 21];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			// North Pole
			color = [255, 255, 255, 64];

			polygon = [37, 25, 57];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [44, 52, 60];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [57, 21, 60];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [27, 60, 37];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			color = [192, 192, 192, 64];

			polygon = [31, 44, 52];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [52, 60, 21];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [60, 37, 57];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [44, 27, 60];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			// South Pole
			color = [255, 255, 255, 64];

			polygon = [40, 48, 30];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [59, 36, 56];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [20, 48, 56];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [26, 40, 56];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			color = [192, 192, 192, 64];

			polygon = [24, 36, 59];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [20, 59, 56];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [40, 48, 56];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [26, 36, 56];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			// Indian Ocean
			color = [0, 0, 255, 64];

			polygon = [47, 48, 30];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [51, 50, 35];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [22, 47, 35];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [20, 48, 35];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			color = [102, 102, 255, 64];

			polygon = [51, 50, 28];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [22, 50, 35];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [47, 48, 35];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [20, 51, 35];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			// Pilippine Sea
			color = [255, 128, 0, 64];

			polygon = [47, 39, 30];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [58, 37, 55];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [55, 25, 39];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [22, 55, 47];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			color = [255, 178, 102, 64];

			polygon = [27, 58, 37];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [37, 55, 25];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [55, 47, 39];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [58, 22, 55];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			//
			color = [153, 51, 255, 64];

			polygon = [30, 33, 40];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [45, 53, 61];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [40, 45, 26];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [33, 29, 45];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			color = [204, 153, 255, 64];

			polygon = [53, 61, 23];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [45, 26, 61];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [33, 40, 45];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [29, 45, 53];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			//
			color = [0, 255, 0, 64];

			polygon = [39, 30, 33];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [57, 41, 49];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [41, 33, 29];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [25, 39, 41];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			color = [153, 255, 153, 64];

			polygon = [49, 57, 21];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [41, 29, 49];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [39, 41, 33];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			polygon = [25, 57, 41];
			polygonreference = czml.createPolygonReference(polygon);
			polygonid = polygon.join("-");
			results = czml.createPolygon(polygonid, polygonid, polygonid, color, extrudeheight, polygonreference, results);

			return res.json(results);
		});

		// Handle Errors
		if(err) {
			console.log(err);
		}
	});
};

exports.createCountry = function(req, res) {

	var pg = require('pg');
	var czml = require('./createCzml.js');

        var connectionString = 'postgres://leylines:leylines@localhost:5432/leylines';
	var results = [];

	// Print Header
	results = czml.createHeader(results);

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done) {

		// SQL Query > Select Data
		//var querystatement = "SELECT ST_AsText(geom) FROM environment.countries"
		var querystatement = "SELECT ST_AsGeoJSON(geom) FROM environment.countries";
		querystatement += " WHERE name = '";
		querystatement += req.params.country;
		querystatement += "';";
		var query = client.query(querystatement);
		var polygon = [];

		// Stream results back one row at a time
		query.on('row', function(row) {
			var polygons = JSON.parse(row.st_asgeojson);
			for (var i=0, tot0=polygons.coordinates.length; i<tot0; i++) {
				polygon[i] = [];
				for (var k=0, tot2=polygons.coordinates[i][0].length; k<tot2; k++) {
					polygon[i].push(polygons.coordinates[i][0][k][0]);
					polygon[i].push(polygons.coordinates[i][0][k][1]);
					polygon[i].push(0.0);
				}
			}
		});

		// After all data is returned, close connection and return results
		query.on('end', function() {
			client.end();
			for (var i=0, tot=polygon.length; i<tot; i++) {
				var color = [255,255,255,100];
				var polygonid = i;
				var extrudeheight = 10000;
				results = czml.createPolygonCarto(polygonid, polygonid, polygonid, color, extrudeheight, polygon[i], results);
			}
			return res.json(results);
		});

		// Handle Errors
		if(err) {
			console.log(err);
		}
	});
};

exports.createMegalithic = function(req, res) {

	var pg = require('pg');
	var czml = require('./createCzml.js');
        var connectionString = 'postgres://leylines:leylines@localhost:5432/leylines';
	var results = [];

	// Print Header
	results = czml.createHeader(results);

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done) {

		// SQL Query > Select Data
		var querystatement = "SELECT sid, object_type, place, x_coord, y_coord, icon, country FROM megalithic.sites";
		querystatement += " WHERE type_id = '";
		querystatement += req.params.type;
		querystatement += "';";
		var query = client.query(querystatement);

		// Stream results back one row at a time
		query.on('row', function(row) {
			var description = "<!--HTML-->\r\n<p>\r\n";
			description += "<table>";
			description += "<tr><td width=\"120px\">Country</td><td width=\"50px\"></td><td>" + row.country + "</td></tr>";
			description += "<tr><td>Type</td><td><img src=\"/images/megalithic/" + row.icon + ".gif\"><td>" + row.object_type + "</td></tr>";
			description += "<tr><td>Data Custodian</td><td></td><td><a href=\"http://www.megalithic.co.uk/article.php?sid=" + row.sid + "\" target=\"_blank\">megalithic.co.uk</a></td></tr>";
			description += "</table>";
			description += "\r\n</p>";
			var icon = "/images/megalithic/" + row.icon + ".gif";
			var scale = 0.7;
			results = czml.createPoint(row.sid, row.place, description, icon, scale, row.x_coord, row.y_coord, 0.0, results);
		});

		// After all data is returned, close connection and return results
		query.on('end', function() {
			client.end();
			return res.json(results);
		});

		// Handle Errors
		if(err) {
			console.log(err);
		}
	});
};

exports.createMontelius = function(req, res) {

	var pg = require('pg');
	var czml = require('./createCzml.js');
        var connectionString = 'postgres://leylines:leylines@localhost:5432/leylines';
	var results = [];

	// Print Header
	results = czml.createHeader(results);

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done) {

		var count = 2;

		function endHandler () {
			count--; // decrement count by 1
			if (count === 0) {
				// two queries have ended, lets close the connection.
				client.end();
				return res.json(results);
			}
		}

		// SQL Query > Select Data
		var querystatement1 = "SELECT sid, object_type, place, x_coord, y_coord, icon, country FROM megalithic.sites";
		querystatement1 += " WHERE country = '";
		querystatement1 += req.params.country;
		querystatement1 += "';";
		var query1 = client.query(querystatement1);

		// Stream results back one row at a time
		query1.on('row', function(row) {
			var description = "<!--HTML-->\r\n<p>\r\n";
			description += "<table>";
			description += "<tr><td width=\"120px\">Country</td><td width=\"50px\"></td><td>" + row.country + "</td></tr>";
			description += "<tr><td>Type</td><td><img src=\"/images/megalithic/" + row.icon + ".gif\"><td>" + row.object_type + "</td></tr>";
			description += "<tr><td>Data Custodian</td><td></td><td><a href=\"http://www.megalithic.co.uk/article.php?sid=" + row.sid + "\" target=\"_blank\">megalithic.co.uk</a></td></tr>";
			description += "</table>";
			description += "\r\n</p>";
			var icon = "/images/megalithic/" + row.icon + ".gif";
			var scale = 0.6;
			results = czml.createPoint(row.sid, row.place, description, icon, scale, row.x_coord, row.y_coord, results);
		});

		// SQL Query > Select Data
		var querystatement2 = "SELECT gid, place, x_coord, y_coord, country FROM montelius.montelius";
		querystatement2 += " WHERE country = '";
		querystatement2 += req.params.country;
		querystatement2 += "';";
		var query2 = client.query(querystatement2);

		// Stream results back one row at a time
		query2.on('row', function(row) {
			var description = "<!--HTML-->\r\n<p>\r\n";
			description += "<table>";
			description += "<tr><td width=\"120px\">Country</td><td width=\"50px\"></td><td>" + row.country + "</td></tr>";
			description += "</table>";
			description += "\r\n</p>";
			var icon = "/images/button_white.svg";
			var scale = 0.04;
			results = czml.createPoint(row.gid, row.place, row.place, icon, scale, row.x_coord, row.y_coord, results);
		});

		// After all data is returned, close connection and return results
		query1.on('end', endHandler);
		query2.on('end', endHandler);

		// Handle Errors
		if(err) {
			console.log(err);
		}
	});
};

exports.createPOI = function(req, res) {

	var pg = require('pg');
	var czml = require('./createCzml.js');
        var connectionString = 'postgres://leylines:leylines@localhost:5432/leylines';
	var results = [];

	// Print Header
	results = czml.createHeader(results);

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done) {

		var maintable = req.params.schema + "." + req.params.table;
		var typetable = "object_types";
		var subtypetable = "object_sub_types";
		//var pointcoords = [];

		// SQL Query > Select Data
		var querystatement = "SELECT " + maintable + ".site,";
		querystatement += maintable + ".description,";
		querystatement += typetable + ".object_type,";
		querystatement += subtypetable + ".object_type AS object_sub_type,";
		querystatement += maintable + ".data_owner,";
		querystatement += maintable + ".links,";
		querystatement += maintable + ".x_coord,";
		querystatement += maintable + ".y_coord,";
		querystatement += maintable + ".z_coord,";
		querystatement += maintable + ".country";
		querystatement += " FROM ";
		querystatement += maintable;
		querystatement += " INNER JOIN " + typetable + " ON " + maintable + ".object_type = " + typetable + ".id";
		querystatement += " INNER JOIN " + subtypetable + " ON " + maintable + ".object_sub_type = " + subtypetable + ".id";
		querystatement += ";";
		//console.log(querystatement);
		var query = client.query(querystatement);
		var id = 1;

		// Stream results back one row at a time
		query.on('row', function(row) {
			if (!row.description) {
				row.description = row.site;
			}
			var wikipedialink = "<a href=\"https://en.wikipedia.org/wiki/" + row.site.replace(" ", "_") + "\">" + row.site + "</a>";
			var links = "<a href=\"" + row.links + "\">" + row.links + "</a>";
			var icon = "/images/" + req.params.icon;
			var scale = 0.2;
			var description = "<!--HTML-->\r\n<p>\r\n";
			description += "<table>";
			description += "<tr><td style=\"width: 360px; padding: 4px\" colspan=\"2\">" + row.description + "</td></tr>";
			if (row.object_type != "unknown") {
				description += "<tr><td style=\"width: 120px; padding: 4px\">Type:</td><td style=\"width: 240px\">" + row.object_type + "</td></tr>";
			}
			if (row.object_sub_type != "unknown") {
				description += "<tr><td style=\"width: 120px; padding: 4px\">Subtype:</td><td style=\"width: 240px\">" + row.object_sub_type + "</td></tr>";
			}
			description += "<tr><td style=\"width: 120px; padding: 4px\">Wikipedia:</td><td style=\"width: 240px\">" + wikipedialink + "</td></tr>";
			if (row.data_owner) {
				description += "<tr><td style=\"width: 120px; padding: 4px\">Custodian:</td><td style=\"width: 240px\">" + row.data_owner + "</td></tr>";
			}
			if (row.links) {
				description += "<tr><td style=\"width: 120px; padding: 4px\">Links:</td><td style=\"width: 240px\">" + links + "</td></tr>";
			}
			if (row.country) {
				description += "<tr><td style=\"width: 120px; padding: 4px\">Country:</td><td style=\"width: 240px\">" + row.country + "</td></tr>";
			}
			description += "</table>";
			description += "\r\n</p>";
			results = czml.createPoint(id, row.site, description, icon, scale, row.x_coord, row.y_coord, row.z_coord, results);
			id++;
		});

		// After all data is returned, close connection and return results
		query.on('end', function() {
			client.end();
			return res.json(results);
		});

		// Handle Errors
		if(err) {
			console.log(err);
		}
	});
};

exports.createVolcano = function(req, res) {

	var pg = require('pg');
	var czml = require('./createCzml.js');
        var connectionString = 'postgres://leylines:leylines@localhost:5432/leylines';
	var results = [];

	// Print Header
	results = czml.createHeader(results);

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done) {

		// SQL Query > Select Data
		var querystatement = "SELECT site, description, object_type, x_coord, y_coord, z_coord, country FROM environment.";
		querystatement += req.params.table;
		querystatement += " ;";
		var query = client.query(querystatement);
		var id = 1;

		// Stream results back one row at a time
		query.on('row', function(row) {
			var icon = "/images/button_" + req.params.icon + ".svg";
			var scale = 0.03;
			if (!row.description) {
				row.description = row.site;
			}
			results = czml.createPoint(id, row.site, row.description, icon, scale, row.x_coord, row.y_coord, row.z_coord, results);
			id++;
		});

		// After all data is returned, close connection and return results
		query.on('end', function() {
			client.end();
			return res.json(results);
		});

		// Handle Errors
		if(err) {
			console.log(err);
		}
	});
};

exports.createPole = function(req, res) {

	var pg = require('pg');
	var czml = require('./createCzml.js');
        var connectionString = 'postgres://leylines:leylines@localhost:5432/leylines';
	var results = [];

	// Print Header
	results = czml.createHeader(results);

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, function(err, client, done) {

		// SQL Query > Select Data
		var querystatement = "SELECT year, x_coord, y_coord, z_coord, country FROM environment.";
		querystatement += req.params.table;
		querystatement += " ;";
		var query = client.query(querystatement);
		var id = 1;

		// Stream results back one row at a time
		query.on('row', function(row) {
			var icon = "/images/button_" + req.params.icon + ".svg";
			var scale = 0.03;
			var description = row.year;
			var site = row.year;
			results = czml.createPoint(id, site, description, icon, scale, row.x_coord, row.y_coord, row.z_coord, results);
			id++;
		});

		// After all data is returned, close connection and return results
		query.on('end', function() {
			client.end();
			return res.json(results);
		});

		// Handle Errors
		if(err) {
			console.log(err);
		}
	});
};
