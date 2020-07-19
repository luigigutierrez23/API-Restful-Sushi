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

const Articulos = require('../Controllers/articles.controller');

/*---------------------------------------
Creamos las rutas HTTP
--------------------------------------*/

app.get('/mostrar-articulos', Articulos.mostrarArticulos);

app.post('/crear-articulos', verificarToken, Articulos.crearArticulos);

app.put('/editar-articulos/:id', verificarToken, Articulos.editarArticulos);

app.delete('/eliminar-articulos/:id', verificarToken, Articulos.eliminarArticulos);

/*---------------------------------------
Exportamos la ruta
--------------------------------------*/

module.exports = app;