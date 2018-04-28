/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global d3 */


function renderSVG(){
    
    console.time('svg render time');
    document.getElementById('content').style.padding = '8% 1.4% 19.9% 0';
    
    // remove previous map if it was
    d3.select('svg').remove();
    d3.select('canvas').remove();
    
    var width = 700, height = 400, centered;

    // Define color scale
    var color = d3.scale.linear()
          .domain([1, 20])
          .clamp(true)
          .range(['#E8E4F6', '#9488BF']);

    // Set svg width & height
    var svg = d3.select('#content')
          .append('svg')
          .attr('width', width)
          .attr('height', height); 
        
    d3.select('svg').attr('display', 'inline');   
    
    var g = svg.append('g');

    var mapLayer = g.append('g')
          .classed('map-layer', true);

    var textName = g.append('text')
          .classed('text', true)
          .attr('x', 20)
          .attr('y', 45);

    //imported data
    var mapData = JSON.parse(localStorage.geodata);
    //console.log(mapData);
    var features = mapData.features;

    // guess for the projection
    var center = d3.geo.centroid(mapData);
    var scale  = 150;
    var offset = [width/2, height/2];
    var projection = d3.geo.mercator().scale(scale).center(center)
          .translate(offset);

    var path = d3.geo.path().projection(projection);

    // using the path determine the bounds of the current map and use 
    // them to determine better values for the scale and translation
    var bounds  = path.bounds(mapData);
    var hscale  = scale * width  / (bounds[1][0] - bounds[0][0]);
    var vscale  = scale * height / (bounds[1][1] - bounds[0][1]);
    var scale   = (hscale < vscale) ? hscale : vscale;
    var offset  = [width - (bounds[0][0] + bounds[1][0])/2,
        height - (bounds[0][1] + bounds[1][1])/2];

    // new projection
    projection = d3.geo.mercator().center(center)
      .scale(scale).translate(offset);
    
    path = path.projection(projection);

    // Update color scale domain based on data
    color.domain([0, d3.max(features, nameLength)]);

    // Draw each object of geojson as a path
    mapLayer.selectAll('path')
      .data(features)
      .enter().append('path')
      .attr('d', path)
      .attr('vector-effect', 'non-scaling-stroke')
      .style('fill', fill)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);


    // Get object name
    function getName(d){
      return d && d.properties ? d.properties.name : null;
    }

    // Get object name length
    function nameLength(d){
      var n = getName(d);
      return n ? n.length : 0;
    }

    // Get object color
    function fill(d){
      return color(nameLength(d));
    }

    
    function drawText(text){
        textName.style('font-family','Arial')
            .text(text);
    }
    
    // Highlight hovered object
    function mouseover(d){
      d3.select(this).style('fill', 'pink');
      drawText(getName(d));
    }
    
    // Reset object color
    function mouseout(){
      mapLayer.selectAll('path')
        .style('fill', function(d){return centered && d === centered ? '#D5708B' : fill(d);});

      textName.text('');
    }
   
    console.timeEnd("svg render time");
}
  
