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
    
    var width = 700, height = 500;

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
    var offset = [width/2, height/2];
    var projection = d3.geo.mercator().scale(scale).translate(offset);

    var path = d3.geo.path().projection(projection);
    var bounds  = path.bounds(mapData);
    var hscale  = scale * width  / (bounds[1][0] - bounds[0][0]);
    var vscale  = scale * height / (bounds[1][1] - bounds[0][1]);
    var scale   = (hscale < vscale) ? hscale : vscale;

    var projection = d3.geo.mercator().scale(scale).translate(offset);

    var geoGenerator = d3.geoPath()
      .projection(projection)
      .context(context);

    canvas.call(d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed));
    
    function zoomed(){
        var transf = d3.event.transform;
        d3.save();
        canvas.clearRect(0, 0, width, height);
        d3.scale(transf.k, transf.k);
        d3.translate(transf.x, transf.y);
        draw();
        d3.restore();
    }
      
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
      draw();
    }

    geojson = mapData;
    
    function draw() {
      geojson.features.forEach(function(d) {
        context.beginPath();
        context.fillStyle = state.clickedLocation && d3.geoContains(d, state.clickedLocation) ? 'pink' : fill(d);
        geoGenerator(d);
        context.fill();
      });
    }

    d3.select('canvas')
      .on('click', handleClick);

    draw(); 
    
    console.timeEnd('canvas render time');
    console.log("feature count: " + featuresCount);
}

