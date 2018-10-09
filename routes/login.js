var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');
const { OAuth2Client } = require('google-auth-library');
var CLIENT_ID = require('../config/config').CLIENT_ID;
// var SECRET = require('../config/config').SECRET;
const chalk = require('chalk');

// Inicializar variables
var app = express();
const client = new OAuth2Client(CLIENT_ID);

// **************************************************
// Autenticación Google
// **************************************************
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (request, response) => {
    var token = request.body.token || '';

    await verify(token)
        .then(data => {
            Usuario.findOne({ email: data.email }, (err, usuarioBBDD) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error buscando usuario',
                        errors: err
                    });
                }

                if (usuarioBBDD) {
                    if (!usuarioBBDD.google) {
                        return response.status(400).json({
                            ok: false,
                            mensaje: 'Debe usar su autenticación normal'
                        });
                    } else {
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
                    }
                } else {
                    //Crear usuario
                    var usuario = new Usuario();

                    usuario.nombre = data.nombre;
                    usuario.email = data.email;
                    usuario.img = data.img;
                    usuario.google = true;
                    usuario.password = ':)';

                    usuario.save((err, usuarioGuardado) => {
                        if (err) {
                            return response.status(400).json({
                                ok: false,
                                mensaje: 'Error creando usuario',
                                errors: err
                            });
                        }

                        //Crear token
                        var token = jwt.sign(
                            { usuario: usuarioGuardado },
                            SEED,
                            { expiresIn: 14400 });

                        response.status(200).json({
                            ok: true,
                            usuario: usuarioGuardado,
                            token: token,
                            id: usuarioGuardado.id
                        });
                    });
                }
            });

            // return response.status(200).send({
            //     ok: true,
            //     mensaje: 'OK',
            //     data
            // });
        })
        .catch(err => {
            console.error(chalk.red('Se ha producido un error:'), err);

            return response.status(403).send({
                ok: false,
                mensaje: 'Token no válido',
                errors: err.message
            });
        });
});

// **************************************************
// Autenticación normal
// **************************************************

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