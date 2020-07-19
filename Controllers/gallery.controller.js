/*---------------------------------------
Importamos el modelo
--------------------------------------*/

const Galeria = require('../Models/gallery.model');

//Sirve para la administración de carpetas y archivos en NodeJS
const fs = require('fs');

/*---------------------------------------
Funcion GET
--------------------------------------*/

let mostrarGaleria = (req,res)=>{

    //https://mongoosejs.com/docs/api.html#model_Model.find

    Galeria.find({})
    .exec((err, data)=>{
        
        if (err) {
            return res.json({
                status:500,
                mensaje:"Error en la petición"
            });
        }

        //Contar la cantidad de registros
        Galeria.countDocuments({}, (err, total)=>{

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

};

/*---------------------------------------
Funcion POST
--------------------------------------*/

let crearGaleria = (req,res)=>{

    //Obtenemos los datos del formulario
    let body = req.body;

    if(!req.files){

        return res.json({
            status:500,
            mensaje:"La imagen no puede ser vacio"
        });

    }

    //Obtenemos el archivo
    let archivo = req.files.foto;

    //Validamos extension del archivo
    if(archivo.mimetype != 'image/jpeg' && archivo.mimetype != 'image/png'){

        return res.json({
            status:400,
            mensaje:"La imagen debe ser formato JPEG o PNG"
        });

    }

    //Validamos tamaño del archivo
    if(archivo.size > 2000000){

        return res.json({
            status:400,
            mensaje:"La imagen debe ser inferior a 2mb"
        });

    }

    //Cambiar nombre al archivo
    let nombre = Math.floor(Math.random()*10000);

    //Capturar extension del archivo
    let extension = archivo.name.split('.').pop();

    //Movemos el archivo a la carpeta
    archivo.mv(`./files/gallery/${nombre}.${extension}`, err =>{

        if(err){

            return res.json({
                status:500,
                mensaje:"Error al guardar la imagen"
            });
        }


        //Obtenemos los datos del formulario para pasarlos al modelo
        let galeria = new Galeria({

            foto: `${nombre}.${extension}`
        });

        //Guardamos en MongoDB
        //https://mongoosejs.com/docs/api.html#model_Model-save

        galeria.save((err,data)=>{

            if(err){

                return res.json({
                    status:400,
                    mensaje:"Error al guardar la foto",
                    err
                });

            }

            res.json({

                status:200,
                data,
                mensaje:"La Foto ha sido creado con exito"

            })
            
        })

    })
    return;
   
}
 

/*---------------------------------------
Funcion PUT
--------------------------------------*/

let editarGaleria = (req,res)=>{

    //Capturamos el id del Galeria a actualizar
    let id = req.params.id;

    //Obtenemos el cuerpo del formulario
    let body = req.body;

    /*---------------------------------------
    Tasks
    --------------------------------------*/

    /*---------------   Validamos que la Galeria exista    ----------------*/

    Galeria.findById(id, (err,data) =>{

        if(err){
            return res.json({
                status:500,
                mensaje:"Error en el servidor"
            });
        }

        //Validamos que la Galeria exista

        if(!data){
            return res.json({
                status:400,
                mensaje:"La foto no existe en la Base de Datos"
            });
        }

        let rutaImagen = data.foto;

        /*---------------   Validamos cambio de imagen    ----------------*/

        let validarCambioArchivo =  (req, rutaImagen)=>{

            return new Promise((resolve, reject)=>{

                if(req.files){

                    //Obtenemos el archivo
                    let archivo = req.files.foto;

                    //Validamos extension del archivo
                    if(archivo.mimetype != 'image/jpeg' && archivo.mimetype != 'image/png'){

                        return res.json({
                            status:400,
                            mensaje:"La imagen debe ser formato JPEG o PNG"
                        });

                        let respuesta = {
                            res:res,
                            mensaje:"la imagen debe ser formato JPEG o PNG"
                        }
                        reject(respuesta);

                    }

                    //Validamos tamaño del archivo
                    if(archivo.size > 2000000){

                        return res.json({
                            status:400,
                            mensaje:"La imagen debe ser inferior a 2mb"
                        });

                        let respuesta = {
                            res:res,
                            mensaje:"La imagen debe ser inferior a 2mb"
                        }
                        reject(respuesta);

                    }

                    //Cambiar nombre al archivo
                    let nombre = Math.floor(Math.random()*10000);

                    //Capturar extension del archivo
                    let extension = archivo.name.split('.').pop();

                    //Movemos el archivo a la carpeta
                    archivo.mv(`./files/gallery/${nombre}.${extension}`, err =>{

                        if(err){

                            return res.json({
                                status:500,
                                mensaje:"Error al guardar la imagen",
                                err
                            });

                            let respuesta = {
                                res:res,
                                mensaje:"Error al guardar la imagen"
                            }
                            reject(respuesta);
                            
                        }

                        //Eliminar archivo anterior
                        if(fs.existsSync(`./files/gallery/${rutaImagen}`)){
                            
                            fs.unlinkSync(`./files/gallery/${rutaImagen}`);

                        }
                        
                        //Gerenamos valor de la nueva imagen
                        rutaImagen = `${nombre}.${extension}`;
                        
                        resolve(rutaImagen);

                    })

                }else{

                    resolve(rutaImagen);

                }

            })

        }   


        /*---------------   Actualizamos los registros    ----------------*/

        let cambiarRegistroBD =  (id, rutaImagen)=>{

            return new Promise((resolve, reject)=>{

                let datosGaleria = {
                    foto: rutaImagen
                }
        
                //Actualizamos en MongoDB
                //https://mongoosejs.com/docs/api.html#model_Model.findByIdAnUpdate
                Galeria.findByIdAndUpdate(id, datosGaleria, {new:true, runValidators:true}, (err,data)=>{
        
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

        validarCambioArchivo(req, rutaImagen).then( rutaImagen =>{
           

            cambiarRegistroBD(id, rutaImagen).then( respuesta =>{

                respuesta["res"].json({

                    status:200,
                    data: respuesta["data"],
                    mensaje: "La foto ha sido actualizado con éxito"

                })

            }).catch( respuesta => {
            
                respuesta["res"].json({
                    status:400,
                    err: respuesta["err"],
                    mensaje:"Error al editar la foto de la galería"
                });
    
            })

        }).catch ( respuesta =>{

            respuesta["res"].json({

                status:400,
                mensaje:respuesta["mensaje"]

            });

        })

    });  

}

/*---------------------------------------
Funcion DELETE
--------------------------------------*/

let eliminarGaleria = (req, res) => {

    //Capturamos el id del Galeria a actualizar
    let id = req.params.id;

    //Obtenemos el cuerpo del formulario
    let body = req.body;

    Galeria.findById(id, (err,data) =>{

        if(err){
            return res.json({
                status:500,
                mensaje:"Error en el servidor"
            });
        }

        //Validamos que el Galeria exista

        if(!data){
            return res.json({
                status:400,
                mensaje:"La foto no existe en la Base de Datos"
            });
        }

        //Eliminar archivo anterior
        if(fs.existsSync(`./files/gallery/${data.foto}`)){
                            
            fs.unlinkSync(`./files/gallery/${data.foto}`);

        }

        //Eliminar registro en MongoDB
        //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove

        Galeria.findByIdAndRemove(id , (err, data) =>{

            if(err){
                return res.json({
                    status:500,
                    mensaje:"Error al eliminar la foto de la galería"
                });
            }

            res.json({

                status:200,
                mensaje:"La foto de la galería ha sido eliminada correctamente"

            })

        })

    })

}

/*---------------------------------------
EXPORTAMOS LAS FUNCIONES DEL CONTROLADOR
--------------------------------------*/

module.exports = {
    mostrarGaleria,
    crearGaleria,
    editarGaleria,
    eliminarGaleria
}