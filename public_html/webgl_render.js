/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global d3, Float32Array */

var gl;

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
                   loadShader('custom.geo.json', function(err, map){
                       if(err){
                           console.error(err);
                       }else {
                            run(vs, fs, map);
                       }
                   });
               }
            });
        }
    }); 
};

var run = function(vs, fs, map){
    
    var canvas = document.getElementsByTagName('canvas');
    gl = d3.select('canvas')
          .node()
          .getContext('webgl');
    
    
    if(!gl){
        alert('Your browser does not support webGL');
    }
    
    gl.clearColor(255, 255, 255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    //create shaders
    
    var vShader = gl.createShader(gl.VERTEX_SHADER);
    var fShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    gl.shaderSource(vShader, vs);
    gl.shaderSource(fShader, fs);
    gl.compileShader(vShader);
    gl.compileShader(fShader);
    
    var program = gl.createProgram();
    
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    
    //create buffer
    
    //var vertices  = map.features;
    var vertices = [
      1.0, 1.0,
     -1.0, 1.0,
      1.0, -1.0,
     -1.0, -1.0
  ];
    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    //gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    
    var attrPosLoc = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(attrPosLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attrPosLoc);
    
    gl.useProgram(program);
    
    var color = gl.getUniformLocation(program, 'color');
    gl.uniform4fv(color, [1.0, 1.0, 1.0, 1.0]);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, 4.5);
    
    
    console.log('work!');

};
