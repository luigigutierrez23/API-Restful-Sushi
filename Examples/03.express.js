/*---------------------------------------
UBICAMOS LOS REQUERIMIENTOS
--------------------------------------*/
const express = require('express');

/*---------------   Creamos una variable para tener todas las funcionalidades de express    ----------------*/
const app = express();


/*---------------   Peticiones GET    ----------------*/
app.get('/', (req,res)=>{

    let salida ={
        nombre: "Juan",
        edad:37,
        url:req.url
    } 

    res.send(salida);

});

/*---------------   Salida puerto HTTP    ----------------*/

app.listen(4000, ()=>{
    console.log("Habilitado el puerto 4000");
})