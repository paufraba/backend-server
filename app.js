// Requires
var express = require('express');
const chalk = require('chalk');
var mongoose = require('mongoose');
var setTitle = require('console-title');



// Inicializar variables
var app = express();
const puerto = 3000;
setTitle('Servidor REST');

// Conexión BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true }, (err, res) => {
    if (err) {
        console.error('Conexión a la base de datos: ' + chalk.red('KO'));

        throw err;
    }

    console.log('Conexión a la base de datos: ' + chalk.green('OK'));
});



// Rutas
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(puerto, () => {
    console.log('Express server arrancado en el puerto ' + chalk.blue(puerto) + ': ' + chalk.green('OK'));

})
