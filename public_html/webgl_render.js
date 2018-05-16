/* global Float32Array, earcut, d3 */


var loadShader = function(fileName, callback){
    var request = new XMLHttpRequest();
    request.open('GET', fileName, true);
    request.onload = function(){
        callback(null, request.responseText);
    };
    request.send();
};


var init = function (){
    console.time('webgl render time');
    loadShader('vs.glsl', function(err, vs){
        if(err){
            console.error(err);
        }else{
            loadShader('fs.glsl', function(err, fs){
               if(err){
                   console.error(err);
               } else {
                 renderWebgl(vs, fs);
                 console.timeEnd('webgl render time');
               }
            });
        }
    }); 
};


var renderWebgl = function (vertexShaderText, fragmentShaderText) {

    document.getElementById('content').style.padding = '8% 1.4% 19.9% 0';

    // remove previous map if it was
    d3.select('canvas').remove();
    d3.select('svg').remove();

    var width = 700, height = 400;

    var canvas = d3.select('#content')
            .append('canvas')
            .attr('width', width)
            .attr('height', height);    

    var gl = canvas.node().getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not support WebGL');
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.CULL_FACE);

    //gl.setTransform(1, 0, 0, -1, 0, height);
    
    // Create shaders 
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }
    
    //imported data
    var mapData = JSON.parse(localStorage.geodata);
    
    // guess for the projection
    var center = d3.geo.centroid(mapData);
    var offset = [width/100, height/500];
    
//    projection = d3.geo.mercator().scale(scale).center(center)
//        .translate(offset);

    projection = d3.geo.mercator().center(center)
        .translate(offset).scale(60);
 
    var vertcount = 0;
     
    //rendering each feature in a loop
    for(var k = 0; k < mapData.features.length; k++){

        //all coordinates put in one array
       var rvert = [];
       var feature = mapData.features[k];
       
       for (var n = 0; n < feature.geometry.coordinates[0].length; n++){
            var projCoord = projection(feature.geometry.coordinates[0][n]);
           // rvert.push(projCoord[0], projCoord[1]);
           rvert.push(feature.geometry.coordinates[0][n][0], feature.geometry.coordinates[0][n][1]);
             projCoord = [];
       }
         vertcount+=rvert.length/2;  
        
       //by using earcut.js script get indices of a feature
       var featureIndices = earcut(rvert);

       gl.useProgram(program);
       
       //create buffers for vertices and indices of a feature
       var VBO = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
       gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rvert), gl.STATIC_DRAW);

       var EBO = gl.createBuffer();
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
       gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(featureIndices), gl.STATIC_DRAW);

       var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');

       gl.vertexAttribPointer(
            positionAttribLocation, // Attribute location
            2, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            gl.FALSE,
            2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex to this attribute
       );

       gl.enableVertexAttribArray(positionAttribLocation);
       
       var featureColor = gl.getUniformLocation(program, 'featureColor');
       gl.uniform3fv(featureColor, [0.55, 0.10, 0.98]);

       gl.drawElements(gl.TRIANGLES, featureIndices.length, gl.UNSIGNED_SHORT, 0);
    }
    console.log(vertcount);
};