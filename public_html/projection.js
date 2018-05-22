/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global d3 */

var width = 700, height = 400;
var mapData = JSON.parse(localStorage.geodata);
var features = mapData.features;
var featuresCount = mapData.features.length;

// guess for the projection
var center = d3.geo.centroid(mapData);
var scale  = 150;
var offset = [width/2, height/2];
var projection = d3.geo.mercator().scale(scale).translate(offset);

var path = d3.geo.path().projection(projection);

// using the path determine the bounds of the current map and use 
// them to determine better values for the scale and translation
var bounds  = path.bounds(mapData);
var hscale  = scale * width  / (bounds[1][0] - bounds[0][0]);
var vscale  = scale * height / (bounds[1][1] - bounds[0][1]);
     scale   = (hscale < vscale) ? hscale : vscale;
 var offset  = [width - (bounds[0][0] + bounds[1][0])/2,
    height - (bounds[0][1] + bounds[1][1])/2];

// new projection
 projection = d3.geo.mercator().scale(scale).translate(offset).center(center);