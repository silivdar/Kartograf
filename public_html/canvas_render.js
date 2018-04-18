/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global d3 */

var clicked = false;

function renderCanvas(){
    
   // if(clicked === false){

        
        document.getElementById('content').style.padding = '5% 1.4% 22.9% 0';
        
        var geojson = {};  
            
        var canvas = d3.select('#content')
          .append('canvas')
          .attr('width', 700)
          .attr('height', 400);    
                       
         var context = canvas.node().getContext('2d');           
         
        // Define color scale
        var color = d3.scale.linear()
           .domain([1, 20])
           .clamp(true)
           .range(['#E8E4F6', '#9488BF']); 
        
        
        //imported data
        var mapData = JSON.parse(localStorage.geodata);
        //var features = mapData.features;
        
        // guess for the projection
        var center = d3.geo.centroid(mapData);
        var scale  = 150;
        var offset = [800/2.5, 400/2];
        var projection = d3.geo.mercator().scale(scale).center(center)
            .translate(offset);

        var path = d3.geo.path().projection(projection);
        var bounds  = path.bounds(mapData);
        var hscale  = scale * 800  / (bounds[1][0] - bounds[0][0]);
        var vscale  = scale * 400 / (bounds[1][1] - bounds[0][1]);
        var scale   = (hscale < vscale) ? hscale : vscale;
        
        var projection = d3.geo.mercator().scale(scale).center(center)
            .translate(offset);
       

        var geoGenerator = d3.geoPath()
          .projection(projection)
          .context(context);
        
        var state = {
          clickedLocation: null
        };

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
            
        function handleClick() {
          var pos = d3.mouse(this);
          state.clickedLocation = projection.invert(pos);
          update();
        }

        function update() {
          context.clearRect(0, 0, 700, 400);

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

    }
    //clicked = true;
//}