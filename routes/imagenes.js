var express = require('express');
const path = require('path');
const fs = require('fs');

// Inicializar variables
var app = express();

app.get('/:tipo/:img', (request, response, next) => {
    var tipo = request.params.tipo;
    var img = request.params.img;

    var rutaImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (!fs.existsSync(rutaImagen)) {
        rutaImagen = path.resolve(__dirname, '../assets/img/no-img.jpg');
    }

    response.sendFile(rutaImagen);

    // response.status(200).json({
    //     ok: true,
    //     mensaje: 'Petición realizada correctamente'
    // });
});

module.exports = app;