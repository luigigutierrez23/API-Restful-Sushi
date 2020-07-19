/*---------------------------------------
REQUERIMIENTOS
--------------------------------------*/

const mongoose = require('mongoose');

/*---------------------------------------
ESQUEMA PARA EL MODELO CONECTOR A MONGODB
--------------------------------------*/

let Schema = mongoose.Schema;
let articleSchema = new  Schema({

    portada:{
        type:String,
        required: [true, "La imagen es obligatoria"]
    },
    titulo:{
        type:String,
        required: [true, "El titulo es obligatoria"]
    },
    intro:{
        type:String,
        required: [true, "La introduccion es obligatoria"]
    },
    url:{
        type:String,
        required: [true, "La url es obligatoria"]
    },
    contenido:{
        type:String,
        required: [true, "El contenido es obligatoria"]
    }

});

/*---------------------------------------
Exportamos el modelo
--------------------------------------*/

module.exports = mongoose.model("articles", articleSchema);