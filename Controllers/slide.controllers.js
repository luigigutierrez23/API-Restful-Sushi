/*---------------------------------------
Importamos el modelo
--------------------------------------*/

const Slide = require('../Models/slide.model');

//Sirve para la administración de carpetas y archivos en NodeJS
const fs = require('fs');

/*---------------------------------------
Funcion GET
--------------------------------------*/

let mostrarSlide = (req,res)=>{

    //https://mongoosejs.com/docs/api.html#model_Model.find

    Slide.find({})
    .exec((err, data)=>{
        
        if (err) {
            return res.json({
                status:500,
                mensaje:"Error en la petición"
            });
        }

        //Contar la cantidad de registros
        Slide.countDocuments({}, (err, total)=>{

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

let crearSlide = (req,res)=>{

    //Obtenemos los datos del formulario
    let body = req.body;

    if(!req.files){

        return res.json({
            status:500,
            mensaje:"La imagen no puede ser vacio"
        });

    }

    //Obtenemos el archivo
    let archivo = req.files.archivo;

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
    archivo.mv(`./files/slide/${nombre}.${extension}`, err =>{

        if(err){

            return res.json({
                status:500,
                mensaje:"Error al guardar la imagen"
            });
        }


        //Obtenemos los datos del formulario para pasarlos al modelo
        let slide = new Slide({

            imagen: `${nombre}.${extension}`,
            titulo: body.titulo,
            descripcion: body.descripcion

        });

        //Guardamos en MongoDB
        //https://mongoosejs.com/docs/api.html#model_Model-save

        slide.save((err,data)=>{

            if(err){

                return res.json({
                    status:400,
                    mensaje:"Error al guardar el slide",
                    err
                });

            }

            res.json({

                status:200,
                data,
                mensaje:"El slide ha sido creado con exito"

            })
            
        })

    })
    return;
   
}
 

/*---------------------------------------
Funcion PUT
--------------------------------------*/

let editarSlide = (req,res)=>{

    //Capturamos el id del slide a actualizar
    let id = req.params.id;

    //Obtenemos el cuerpo del formulario
    let body = req.body;

    /*---------------------------------------
    Tasks
    --------------------------------------*/

    /*---------------   Validamos que el Slide exista    ----------------*/

    Slide.findById(id, (err,data) =>{

        if(err){
            return res.json({
                status:500,
                mensaje:"Error en el servidor"
            });
        }

        //Validamos que el Slide exista

        if(!data){
            return res.json({
                status:400,
                mensaje:"El slide no existe en la Base de Datos"
            });
        }

        let rutaImagen = data.imagen;

        /*---------------   Validamos cambio de imagen    ----------------*/

        let validarCambioArchivo =  (req, rutaImagen)=>{

            return new Promise((resolve, reject)=>{

                if(req.files){

                    //Obtenemos el archivo
                    let archivo = req.files.archivo;

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
                    archivo.mv(`./files/slide/${nombre}.${extension}`, err =>{

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
                        if(fs.existsSync(`./files/slide/${rutaImagen}`)){
                            
                            fs.unlinkSync(`./files/slide/${rutaImagen}`);

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

        let cambiarRegistroBD =  (id, body, rutaImagen)=>{

            return new Promise((resolve, reject)=>{

                let datosSlide = {

                    imagen: rutaImagen,
                    titulo: body.titulo,
                    descripcion: body.descripcion
        
                }
        
                //Actualizamos en MongoDB
                //https://mongoosejs.com/docs/api.html#model_Model.findByIdAnUpdate
                Slide.findByIdAndUpdate(id, datosSlide, {new:true, runValidators:true}, (err,data)=>{
        
                    if(err){

                        let respuesta = {
                            res:res,
                            err: err
                        }

                        reject(respuesta);
        
                        // return res.json({
                        //     status:400,
                        //     mensaje:"Error al editar el Slide",
                        //     err
                        // });
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

            cambiarRegistroBD(id, body, rutaImagen).then( respuesta =>{

                respuesta["res"].json({

                    status:200,
                    data: respuesta["data"],
                    mensaje: "El slide ha sido actualizado con éxito"

                })

            }).catch( respuesta => {

                respuesta["res"].json({
                    status:400,
                    err: respuesta["err"],
                    mensaje:"Error al editar el slide"
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

let eliminarSlide = (req, res) => {

    //Capturamos el id del slide a actualizar
    let id = req.params.id;

    //Obtenemos el cuerpo del formulario
    let body = req.body;

    Slide.findById(id, (err,data) =>{

        if(err){
            return res.json({
                status:500,
                mensaje:"Error en el servidor"
            });
        }

        //Validamos que el Slide exista

        if(!data){
            return res.json({
                status:400,
                mensaje:"El slide no existe en la Base de Datos"
            });
        }

        //Eliminar archivo anterior
        if(fs.existsSync(`./files/slide/${data.imagen}`)){
                            
            fs.unlinkSync(`./files/slide/${data.imagen}`);

        }

        //Eliminar registro en MongoDB
        //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove

        Slide.findByIdAndRemove(id , (err, data) =>{

            if(err){
                return res.json({
                    status:500,
                    mensaje:"Error al eliminar el Slide"
                });
            }

            res.json({

                status:200,
                mensaje:"El slide ha sido eliminado correctamente"

            })

        })

    })

}

/*---------------------------------------
EXPORTAMOS LAS FUNCIONES DEL CONTROLADOR
--------------------------------------*/

module.exports = {
    mostrarSlide,
    crearSlide,
    editarSlide,
    eliminarSlide
}