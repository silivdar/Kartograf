/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global d3 */


function renderCanvas(){
    
    console.time('canvas render time');
    document.getElementById('content').style.padding = '8.08% 1.4% 19.8% 0.5%';

    // remove previous map 
    d3.select('canvas').remove();
    d3.select('svg').remove();

    var geojson = {}; 
    
    var width = 700, height = 400;

    var canvas = d3.select('#content')
      .append('canvas')
      .attr('width', width)
      .attr('height', height);    

    var context = canvas.node().getContext('2d');           

    var color = d3.scale.linear()
       .domain([1, 20])
       .clamp(true)
       .range(['#E8E4F6', '#9488BF']); 

    //imported data
    var mapData = JSON.parse(localStorage.geodata);
    var featuresCount = mapData.features.length;

    // guess for the projection
    var center = d3.geo.centroid(mapData);
    var scale  = 150;
    var offset = [width/2, height/2.15];
    var projection = d3.geo.mercator().scale(scale).center(center)
        .translate(offset);

    var path = d3.geo.path().projection(projection);
    var bounds  = path.bounds(mapData);
    var hscale  = scale * width  / (bounds[1][0] - bounds[0][0]);
    var vscale  = scale * height / (bounds[1][1] - bounds[0][1]);
    var scale   = (hscale < vscale) ? hscale : vscale;

    var projection = d3.geo.mercator().scale(scale).center(center)
        .translate(offset);

    var geoGenerator = d3.geoPath()
      .projection(projection)
      .context(context);

    var state = {
      clickedLocation: null
    };

    function getName(d){
      return d && d.properties ? d.properties.name : null;
    }

    function nameLength(d){
      var n = getName(d);
      return n ? n.length : 0;
    }

    function fill(d){
      return color(nameLength(d));
    }

    function handleClick() {
      var pos = d3.mouse(this);
      state.clickedLocation = projection.invert(pos);
      update();
    }

    function update() {
      context.clearRect(0, 0, width, height);

      geojson.features.forEach(function(d) {
        context.beginPath();
        context.fillStyle = state.clickedLocation && d3.geoContains(d, state.clickedLocation) ? 'pink' : fill(d);
        geoGenerator(d);
        context.fill();
      });
    }

    geojson = mapData;

    d3.select('canvas')
      .on('click', handleClick);

    update(); 
    
    console.timeEnd('canvas render time');
    console.log("feature count: " + featuresCount);
}

