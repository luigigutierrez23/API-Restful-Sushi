/*---------------------------------------
REQUERIMIENTOS
--------------------------------------*/
const express = require('express');
const app = express();

/*---------------------------------------
Importar Middleware
--------------------------------------*/

const {verificarToken} = require('../middlewares/auth');

/*---------------------------------------
Importamos el controlador
--------------------------------------*/

const Slide = require('../Controllers/slide.controllers');

/*---------------------------------------
Creamos las rutas HTTP
--------------------------------------*/

app.get('/mostrar-slide', Slide.mostrarSlide);

app.post('/crear-slide', verificarToken, Slide.crearSlide);

app.put('/editar-slide/:id', verificarToken, Slide.editarSlide);

app.delete('/eliminar-slide/:id', verificarToken, Slide.eliminarSlide);

/*---------------------------------------
Exportamos la ruta
--------------------------------------*/

module.exports = app;