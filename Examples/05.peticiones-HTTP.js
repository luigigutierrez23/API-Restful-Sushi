/*---------------------------------------
UBICAMOS LOS REQUERIMIENTOS
--------------------------------------*/
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

/*---------------------------------------
Creamos una variable para tener todas 
las funcionalidades de express
--------------------------------------*/
const app = express();

/*---------------------------------------
Middleware para Body Parser
--------------------------------------*/

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}));

//parse application/json
app.use(bodyParser.json());

/*---------------------------------------
ESQUEMA PARA EL MODELO CONECTOR A MONGODB
--------------------------------------*/

let Schema = mongoose.Schema;
let slideSchema = new  Schema({

    imagen:{
        type:String,
        required: [true, "La imagen es obligatoria"]
    },
    titulo:{
        type:String,
        required:false
    },
    descripcion:{
        type:String,
        required:false
    }

});

const Slide = mongoose.model("slides", slideSchema);


/*---------------   Peticiones GET    ----------------*/
app.get('/', (req,res)=>{

    //https://mongoosejs.com/docs/api.html#model_Model.find

    Slide.find({})
    .exec((err, data)=>{
        
        if (err) {
            return res.json({
                status:500,
                mensaje:"Error en la petición"
            });
        }

        res.json({

            status: 200,
            data

        });

    });

});

/*---------------   Peticiones POST    ----------------*/

app.post('/crear-slide', (req, res)=>{

    let slide = req.body;

    res.json({

        slide

    })

});

/*---------------   Peticiones PUT    ----------------*/

app.put('/editar-slide/:id', (req, res)=>{

    let id = req.params.id;

    res.json({

        id

    })

});

/*---------------   Peticiones DELETE    ----------------*/

app.delete('/eliminar-slide/:id', (req, res)=>{

    let id = req.params.id;

    res.json({

        id

    })

});

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

app.listen(4000, ()=>{
    console.log("Habilitado el puerto 4000");
})