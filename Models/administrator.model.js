/*---------------------------------------
REQUERIMIENTOS
--------------------------------------*/

const mongoose = require('mongoose');

/*---------------------------------------
ESQUEMA PARA EL MODELO CONECTOR A MONGODB
--------------------------------------*/

let Schema = mongoose.Schema;
let adminSchema = new  Schema({

    usuario:{
        type:String,
        required: [true, "El usuario es obligatorio"],
        unique:true
    },
    password:{
        type:String,
        required:[true, "La contraseña es obligatoria"]
    }
});

/*---------------------------------------
Evitar devolver en la Data el campo Password
--------------------------------------*/

adminSchema.methods.toJSON = function(){

    let administrador = this;
    let adminObject = administrador.toObject();

    delete adminObject.password;
    
    return adminObject;

}

/*---------------------------------------
Exportamos el modelo
--------------------------------------*/

module.exports = mongoose.model("administrators", adminSchema);