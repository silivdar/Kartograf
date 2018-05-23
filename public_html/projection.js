/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global d3 */
var width = 700, height = 400;

var scale  = 180;
var offset = [width/2.5, height/1.3];


var projection = d3.geo.mercator().scale(scale).translate(offset);
