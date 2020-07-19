/*---------------------------------------
Importamos el modelo
--------------------------------------*/

const Articulos = require('../Models/articles.model');

//Sirve para la administración de carpetas y archivos en NodeJS
const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

/*---------------------------------------
Funcion GET
--------------------------------------*/

let mostrarArticulos = (req,res)=>{

    //https://mongoosejs.com/docs/api.html#model_Model.find

    Articulos.find({})
    .exec((err, data)=>{
        
        if (err) {
            return res.json({
                status:500,
                mensaje:"Error en la petición"
            });
        }

        //Contar la cantidad de registros
        Articulos.countDocuments({}, (err, total)=>{

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

let crearArticulos = (req,res)=>{

    //Obtenemos los datos del formulario
    let body = req.body;

    if(!req.files){

        return res.json({
            status:500,
            mensaje:"La imagen no puede ser vacio"
        });

    }

    //Obtenemos el archivo
    let archivo = req.files.portada;

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

    //Crear carpeta con el nombre de la Url
    let crearCarpeta = mkdirp.sync(`./files/articles/${body.url}`);

    //Movemos el archivo a la carpeta
    archivo.mv(`./files/articles/${body.url}/${nombre}.${extension}`, err =>{

        if(err){

            return res.json({
                status:500,
                mensaje:"Error al guardar la imagen"
            });
        }


        //Obtenemos los datos del formulario para pasarlos al modelo
        let articulos = new Articulos({

            portada: `${nombre}.${extension}`,
            titulo: body.titulo,
            intro: body.intro,
            url:body.url,
            contenido:body.contenido

        });

        //Guardamos en MongoDB
        //https://mongoosejs.com/docs/api.html#model_Model-save

        articulos.save((err,data)=>{

            if(err){

                return res.json({
                    status:400,
                    mensaje:"Error al guardar el Articulos",
                    err
                });

            }

            res.json({

                status:200,
                data,
                mensaje:"El Articulo ha sido creado con exito"

            })
            
        })

    })
   
}
 

/*---------------------------------------
Funcion PUT
--------------------------------------*/

let editarArticulos = (req,res)=>{

    //Capturamos el id del Articulos a actualizar
    let id = req.params.id;

    //Obtenemos el cuerpo del formulario
    let body = req.body;

    /*---------------------------------------
    Tasks
    --------------------------------------*/

    /*---------------   Validamos que el Articulos exista    ----------------*/

    Articulos.findById(id, (err,data) =>{

        if(err){
            return res.json({
                status:500,
                mensaje:"Error en el servidor"
            });
        }

        //Validamos que el Articulos exista

        if(!data){
            return res.json({
                status:400,
                mensaje:"El Articulo no existe en la Base de Datos"
            });
        }

        let rutaImagen = data.portada;

        /*---------------   Validamos cambio de imagen    ----------------*/

        let validarCambioArchivo =  (req, body, rutaImagen)=>{

            return new Promise((resolve, reject)=>{

                if(req.files){

                    //Obtenemos el archivo
                    let archivo = req.files.portada;

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
                    archivo.mv(`./files/articles/${body.url}/${nombre}.${extension}`, err =>{

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
                        if(fs.existsSync(`./files/articles/${body.url}/${rutaImagen}`)){
                            
                            fs.unlinkSync(`./files/articles/${body.url}/${rutaImagen}`);

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

                let datosArticulos = {

                    portada: rutaImagen,
                    titulo: body.titulo,
                    intro: body.intro,
                    url:body.url,
                    contenido:body.contenido
        
                }
        
                //Actualizamos en MongoDB
                //https://mongoosejs.com/docs/api.html#model_Model.findByIdAnUpdate
                Articulos.findByIdAndUpdate(id, datosArticulos, {new:true, runValidators:true}, (err,data)=>{
        
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

        validarCambioArchivo(req, body, rutaImagen).then( rutaImagen =>{

            cambiarRegistroBD(id, body, rutaImagen).then( respuesta =>{

                respuesta["res"].json({

                    status:200,
                    data: respuesta["data"],
                    mensaje: "El Articulo ha sido actualizado con éxito"

                })

            }).catch( respuesta => {

                respuesta["res"].json({
                    status:400,
                    err: respuesta["err"],
                    mensaje:"Error al editar el Articulo"
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

let eliminarArticulos = (req, res) => {

    //Capturamos el id del Articulos a actualizar
    let id = req.params.id;

    //Obtenemos el cuerpo del formulario
    let body = req.body;

    Articulos.findById(id, (err,data) =>{

        if(err){
            return res.json({
                status:500,
                mensaje:"Error en el servidor"
            });
        }

        //Validamos que el Articulos exista

        if(!data){
            return res.json({
                status:400,
                mensaje:"El Articulo no existe en la Base de Datos"
            });
        }

        //Eliminar carpeta del articulo
        let rutaCarpeta = `./files/articles/${data.url}`;
        rimraf.sync(rutaCarpeta);

        //Eliminar registro en MongoDB
        //https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove

        Articulos.findByIdAndRemove(id , (err, data) =>{

            if(err){
                return res.json({
                    status:500,
                    mensaje:"Error al eliminar el Articulo"
                });
            }

            res.json({

                status:200,
                mensaje:"El Articulo ha sido eliminado correctamente"

            })

        })

    })

}

/*---------------------------------------
EXPORTAMOS LAS FUNCIONES DEL CONTROLADOR
--------------------------------------*/

module.exports = {
    mostrarArticulos,
    crearArticulos,
    editarArticulos,
    eliminarArticulos
}