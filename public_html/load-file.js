/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global FileReader */


document.getElementById('imp_btn').addEventListener('click',
    function selectAndUploadFile(){ 

          var file  = document.getElementById('my_file').files[0];
          //console.log(file);

          var reader = new FileReader();

          reader.onloadend = function(evt) {
              if(evt.target.readyState === FileReader.DONE){

                localStorage.geodata = evt.target.result;
                
              }
          };

        reader.readAsBinaryString(file);
}
, false);






