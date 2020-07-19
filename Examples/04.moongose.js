/*---------------------------------------
UBICAMOS LOS REQUERIMIENTOS
--------------------------------------*/
const express = require('express');
const mongoose = require('mongoose');

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

/*---------------   Conexion a la base de Datos    ----------------*/

mongoose.connect('mongodb://localhost:27017/apirest', {
  useNewUrlParser: true,
  useUnifiedTopology: true
},
(err,res) =>{
    if(err) throw err;

    console.log("Conectado a la Base de Datos");

}
);


/*---------------   Salida puerto HTTP    ----------------*/

app.listen(4000, ()=>{
    console.log("Habilitado el puerto 4000");
})