/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global FileReader, projection */

//clean localstorage everytime when page is reloaded
window.onload = function(){
    localStorage.geodata = undefined;
};

document.getElementById('imp_btn').addEventListener('click',
    function selectAndUploadFile(){ 

        var file  = document.getElementById('my_file').files[0];

        var reader = new FileReader();

        reader.onloadend = function(evt) {
            if(evt.target.readyState === FileReader.DONE){

                localStorage.geodata = evt.target.result;
                renderSVG(projection);
            }
        };

        reader.readAsBinaryString(file);
    }
, false);

document.getElementById('first_map').addEventListener('click', 
function loadFirstMap(){
   localStorage.geodata = JSON.stringify(europe);
   renderSVG(projection);
}, false);

document.getElementById('sec_map').addEventListener('click', 
function loadFirstMap(){
   localStorage.geodata = JSON.stringify(czech);
   renderSVG(projection);
}, false);

document.getElementById('th_map').addEventListener('click', 
function loadFirstMap(){
   localStorage.geodata = JSON.stringify(africa);
   renderSVG(projection);
}, false);




