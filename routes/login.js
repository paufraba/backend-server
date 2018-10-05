var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();
var Usuario = require('../models/usuario');

app.post('/', (request, response) => {
    var body = request.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBBDD) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error buscando usuario',
                errors: err
            });
        }

        if (!usuarioBBDD) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el email ' + body.email + ' no existe',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBBDD.password)) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Contraseña incorrecta',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        usuarioBBDD.password = ':)';

        //Crear token
        var token = jwt.sign(
            { usuario: usuarioBBDD },
            SEED,
            { expiresIn: 14400 });

        response.status(200).json({
            ok: true,
            usuario: usuarioBBDD,
            token: token,
            id: usuarioBBDD.id
        });
    });

});

module.exports = app;