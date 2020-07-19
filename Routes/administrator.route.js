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

const Admin = require('../Controllers/administrator.controller');

/*---------------------------------------
Creamos las rutas HTTP
--------------------------------------*/

app.get('/mostrar-administradores', verificarToken, Admin.mostrarAdministradores);

app.post('/crear-administradores', verificarToken, Admin.crearAdministrador);

app.put('/editar-administradores/:id', verificarToken, Admin.editarAdministrador);

app.delete('/eliminar-administradores/:id', verificarToken, Admin.eliminarAdministrador);

app.post('/login', Admin.login);

/*---------------------------------------
Exportamos la ruta
--------------------------------------*/

module.exports = app;