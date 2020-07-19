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

const Galeria = require('../Controllers/gallery.controller');

/*---------------------------------------
Creamos las rutas HTTP
--------------------------------------*/

app.get('/mostrar-galeria', Galeria.mostrarGaleria);

app.post('/crear-galeria', verificarToken, Galeria.crearGaleria);

app.put('/editar-galeria/:id', verificarToken, Galeria.editarGaleria);

app.delete('/eliminar-galeria/:id', verificarToken, Galeria.eliminarGaleria);

/*---------------------------------------
Exportamos la ruta
--------------------------------------*/

module.exports = app;