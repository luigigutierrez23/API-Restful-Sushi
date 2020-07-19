/*---------------------------------------
Importamos el modelo
--------------------------------------*/
const Admin = require('../Models/administrator.model');

/*---------------------------------------
Requerimos modulo para encriptar password
--------------------------------------*/

const bcrypt = require('bcrypt');

//Crear Token de seguridad
const jwt = require('jsonwebtoken');

/*---------------------------------------
Funcion GET
--------------------------------------*/

let mostrarAdministradores = (req, res) => {

    //https://mongoosejs.com/docs/api.html#model_Model.find

    Admin.find({})
    .exec((err, data)=>{
        
        if (err) {
            return res.json({
                status:500,
                mensaje:"Error en la petición"
            });
        }

        //Contar la cantidad de registros
        Admin.countDocuments({}, (err, total)=>{

            if (err) {
                return res.json({
                    status:500,
                    mensaje:"Error en la petición"
                });
            }

            res.json({

                status:200,
                total,
                data

            })

        });

    });


}

/*---------------------------------------
Funcion POST
--------------------------------------*/

let crearAdministrador = (req, res) =>{

    //Obtenemos el cuerpo del formulario
    let body = req.body;


    //Obtenemos los datos del formulario para pasarlos al modelo
    let admin = new Admin({

        usuario: body.usuario,
        password: bcrypt.hashSync(body.password,10)

    });

    //Guardamos en MongoDB
    //https://mongoosejs.com/docs/api.html#model_Model-save

    admin.save((err,data)=>{

        if(err){

            return res.json({
                status:400,
                mensaje:"Error al guardar el administrador",
                err
            });

        }

        res.json({

            status:200,
            data,
            mensaje:"El administrador ha sido creado con exito"

        })
        
    })
}

/*---------------------------------------
Funcion PUT
--------------------------------------*/

let editarAdministrador = (req, res) =>{

     //Capturamos el id del slide a actualizar
     let id = req.params.id;

     //Obtenemos el cuerpo del formulario
     let body = req.body;

     /*---------------   Validamos que el Administrador exista    ----------------*/

    Admin.findById(id, (err,data) =>{

        if(err){
            return res.json({
                status:500,
                mensaje:"Error en el servidor"
            });
        }

        //Validamos que el Administrador exista

        if(!data){
            return res.json({
                status:400,
                mensaje:"El administrador no existe en la Base de Datos"
            });
        }

        let pass = data.password;

        /*---------------   Validamos que haya cambio de contraseña    ----------------*/

        let validarCambioPassword = (body, pass) =>{

            return new Promise((resolve, reject)=>{
                
                if(body.password == undefined){

                    resolve(pass);

                }else{

                    pass = bcrypt.hashSync(body.password,10);
                    resolve(pass);

                }

            })
           

        }

        /*---------------   Actualizamos los registros    ----------------*/

        let cambiarRegistroBD =  (id, body, pass)=>{

            return new Promise((resolve, reject)=>{

                let datosAdmin = {

                    usuario: body.usuario,
                    password: pass
        
                }
        
                //Actualizamos en MongoDB
                //https://mongoosejs.com/docs/api.html#model_Model.findByIdAnUpdate
                Admin.findByIdAndUpdate(id, datosAdmin, {new:true, runValidators:true}, (err,data)=>{
        
                    if(err){

                        let respuesta = {
                            res:res,
                            err: err
                        }

                        reject(respuesta);
        
                    }
    
                    let respuesta = {
                        res:res,
                        data: data
                    }

                    resolve(respuesta);
                });

            })

        }

        /*---------------------------------------
        Sincronizar las promesas
        --------------------------------------*/

        validarCambioPassword(body, pass).then( pass =>{

            cambiarRegistroBD(id, body, pass).then( respuesta =>{

                respuesta["res"].json({

                    status:200,
                    data: respuesta["data"],
                    mensaje: "El administrador ha sido actualizado con éxito"

                })

            }).catch( respuesta => {

                respuesta["res"].json({
                    status:400,
                    err: respuesta["err"],
                    mensaje:"Error al editar el administrador"
                });
    
            })

        }).catch ( respuesta =>{

            respuesta["res"].json({

                status:400,
                mensaje:respuesta["mensaje"]

            });

        })

    }) 

}

/*---------------------------------------
Funcion DELETE
--------------------------------------*/

let eliminarAdministrador = (req, res) =>{

    //Capturamos el id del administrador a actualizar
    let id = req.params.id;

    //Obtenemos el cuerpo del formulario
    let body = req.body;

    Admin.findById(id, (err,data) =>{

        if(err){
            return res.json({
                status:500,
                mensaje:"Error en el servidor"
            });
        }

        //Validamos que el Administrador exista

        if(!data){
            return res.json({
                status:400,
                mensaje:"El administrador no existe en la Base de Datos"
            });
        }

        //Eliminar registro en MongoDB
        //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove

        Admin.findByIdAndRemove(id , (err, data) =>{

            if(err){
                return res.json({
                    status:500,
                    mensaje:"Error al eliminar el administrador"
                });
            }

            res.json({

                status:200,
                mensaje:"El administrador ha sido eliminado correctamente"

            })

        })

    })

}

/*---------------------------------------
Funcion LOGIN
--------------------------------------*/

let login = (req, res) =>{

    //Obtenemos el cuerpo del formulario 
    let body = req.body;

    //Recorremos la BD en busqueda de coincidencia con el usuario
    Admin.findOne({usuario:body.usuario}, (err,data)=>{

        if(err){
            return res.json({
                status:500,
                mensaje:"Error en el servidor"
            });
        }

         //Validamos que el Administrador exista
         if(!data){
            return res.json({
                status:400,
                mensaje:"El usuario es incorrecto"
            });
        }

        if(!bcrypt.compareSync(body.password, data.password)){

            return res.json({
                status:500,
                mensaje:"La contraseña es incorrecta"
            });

        }

        //Generar Token de autorizacion
        let token = jwt.sign({
           
            data
            
        },process.env.SECRET, {expiresIn: process.env.EXPIRED});

        res.json({

            status:200,
            token

        })

    })

}

/*---------------------------------------
EXPORTAMOS LAS FUNCIONES DEL CONTROLADOR
--------------------------------------*/

module.exports = {

    mostrarAdministradores,
    crearAdministrador,
    editarAdministrador,
    eliminarAdministrador,
    login

}