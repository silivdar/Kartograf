/* global Float32Array, earcut, d3 */

'use strict';


var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

var renderWebgl = function () {

        document.getElementById('content').style.padding = '8% 1.4% 19.9% 0';
        
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
       
       //imported data
       //getting coordinates in array
        var mapData = JSON.parse(localStorage.geodata);
        
        
        //array of arrays with coordinates; 
        var coord = [];
        var k = 0;
        for(var i = 0; i < mapData.features.length; i++){
           // k = 0;
                for (var n = 0; n < mapData.features[i].geometry.coordinates[0].length; n++){
                    coord[k] = mapData.features[i].geometry.coordinates[0][n];
                    k++;
                   // coord[k] = mapData.features[i].geometry.coordinates[0][n];
                    //k++;
                }
        }
        console.log(coord);
        console.log(coord.length);
        
        
        //all coordinates in one array
        var coord2 = [];
        var k = 0;
        for(var i = 0; i < mapData.features.length; i++){
           // k = 0;
                for (var n = 0; n < mapData.features[i].geometry.coordinates[0].length; n++){
                    coord2[k] = mapData.features[i].geometry.coordinates[0][0];
                    k++;
                    coord2[k] = mapData.features[i].geometry.coordinates[0][1];
                    k++;
                }
        }
        console.log(coord2);
        console.log(coord2.length);
        
        
        //triangulation
        //var data = earcut.flatten(coord);
        //var triang = earcut(data.holes, data.vertices, 2);
       // console.log(triang);



	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

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
	gl.drawArrays(gl.TRIANGLES, 0, 3);
};