/*---------------------------------------
UBICAMOS LOS REQUERIMIENTOS
--------------------------------------*/
require('./config.js');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

/*---------------------------------------
Creamos una variable para tener todas 
las funcionalidades de express
--------------------------------------*/
const app = express();

/*---------------------------------------
Middleware para Body Parser
--------------------------------------*/

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit:'10mb' ,extended:true}));

//parse application/json
app.use(bodyParser.json({limit:'10mb' ,extended:true}));

/*---------------------------------------
Mongoose Deprecations
--------------------------------------*/

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

/*---------------------------------------
Middleware para File Upload
--------------------------------------*/

//Opciones por defecto
app.use(fileUpload());

/*---------------------------------------
Importamos las Rutas
--------------------------------------*/

app.use(require('./Routes/slide.route'));
app.use(require('./Routes/gallery.route'));
app.use(require('./Routes/articles.route'));
app.use(require('./Routes/administrator.route'));


/*---------------------------------------
Conexion a la base de Datos
--------------------------------------*/

mongoose.connect('mongodb://localhost:27017/apirest', {
  useNewUrlParser: true,
  useUnifiedTopology: true
},
(err,res) =>{
    if(err) throw err;

    console.log("Conectado a la Base de Datos");

}
);

/*---------------------------------------
Salida puerto HTTP
--------------------------------------*/

app.listen(process.env.PORT, ()=>{
    console.log(`Habilitado el puerto ${process.env.PORT}`);
})