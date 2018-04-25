/* global Float32Array, earcut, d3 */

'use strict';


//var vertexShaderText = 
//[
//'precision mediump float;',
//'',
//'attribute vec2 vertPosition;',
//'attribute vec3 vertColor;',
//'varying vec3 fragColor;',
//'',
//'void main()',
//'{',
//'  fragColor = vertColor;',
//'  gl_Position = vec4(vertPosition, 0.0, 1.0);',
//'}'
//].join('\n');
//
//var fragmentShaderText =
//[
//'precision mediump float;',
//'',
//'varying vec3 fragColor;',
//'void main()',
//'{',
//'  gl_FragColor = vec4(fragColor, 1.0);',
//'}'
//].join('\n');



var loadShader = function(fileName, callback){
    var request = new XMLHttpRequest();
    request.open('GET', fileName, true);
    request.onload = function(){
        callback(null, request.responseText);
    };
    request.send();
};


var init = function (){
    loadShader('vs.glsl', function(err, vs){
        if(err){
            console.error(err);
        }else{
            loadShader('fs.glsl', function(err, fs){
               if(err){
                   console.error(err);
               } else {
                 renderWebgl(vs, fs);
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
        
        var canvas = d3.select('#content')
                  .append('canvas')
                  .attr('width', 700)
                  .attr('height', 400);    

        var gl = canvas.node().getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
        
	// Create buffers
        
        //coordinates for test
	var triangleVertices = 
	[ // X, Y,       R, G, B
		0.5, 0.5,    0.0, 0.0, 1.0,
		-0.5, 0.5,  0.0, 0.0, 1.0,
		-0.5, -0.5,   0.0, 0.0, 1.0
	];
       
       var triangleIndices = [0,1,2];
       
       //imported data
       //getting coordinates in array
        var mapData = JSON.parse(localStorage.geodata);
        
        
    function convertCoordToXY(latitude, longitude) {
            var pi_180 = Math.PI / 180.0;
            var pi_4 = Math.PI * 4;
            var sinLatitude = Math.sin(latitude * pi_180);
            var pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (pi_4)) * 256;
            var pixelX = ((longitude + 180) / 360) * 256;

            var pixel = { x: pixelX, y: pixelY };

            return pixel;
        }

    
        //all coordinates in one array
       var rvert = [];
       var feature = mapData.features[0];
       for (var n = 0; n < feature.geometry.coordinates[0].length; n++){
            rvert.push(feature.geometry.coordinates[0][n][0], feature.geometry.coordinates[0][n][1]);
       }
       //console.log(rvert);




       var triangles = earcut(rvert);
       
       for(var i =0; i < triangles.length; i++){
           if(triangles[i] === 0){
               console.log("chyba");
           }
       }
       console.log(triangles);
//                for(var p = 0; p < triangles.length; p++){
//                    var pix = convertCoordToXY(triangles[p], triangles[++p]);
//                  //  console.log(pix);
//                    vert.push(pix.x, pix.y, 0.1, 0.1, 1.0);
//                    p++;
//                };
       // };      
       // console.log(vert);

	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert), gl.STATIC_DRAW);

        var EBO = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleIndices), gl.STATIC_DRAW);


	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
        
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);

	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	//
	// Main render loop
	//
	gl.useProgram(program);
	//gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
};