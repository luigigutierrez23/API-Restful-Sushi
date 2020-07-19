/*---------------------------------------
REQUERIMIENTOS
--------------------------------------*/

const mongoose = require('mongoose');

/*---------------------------------------
ESQUEMA PARA EL MODELO CONECTOR A MONGODB
--------------------------------------*/

let Schema = mongoose.Schema;
let galeriaSchema = new  Schema({

    foto:{
        type:String,
        required: [true, "La imagen es obligatoria"]
    }

});

/*---------------------------------------
Exportamos el modelo
--------------------------------------*/

module.exports = mongoose.model("gallerys", galeriaSchema);