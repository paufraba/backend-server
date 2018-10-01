var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();
var Usuario = require('../models/usuario');

// **************************************************
// GET usuarios
// **************************************************
app.get('/', (request, response, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
            (error, usuarios) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: error
                    });
                }

                response.status(200).json({
                    ok: true,
                    mensaje: 'GET de usuario',
                    usuarios: usuarios
                });
            })
});

// **************************************************
// Verificar token
// **************************************************
app.use('/', (request, response, next) => {
    var token = request.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return response.status(401).json({
                ok: false,
                mensaje: 'Token inválido',
                errors: err
            });
        }

        next();
    });

});

// **************************************************
// POST Usuario
// **************************************************
app.post('/', (request, response) => {
    var body = request.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioBBDD) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error creando usuario',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioBBDD
        });
    });
});

// **************************************************
// PUT usuario
// **************************************************
app.put('/:id', (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error buscando usuario',
                errors: err
            });
        }

        if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioBBDD) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioBBDD.password = ':)';

            response.status(200).json({
                ok: true,
                usuario: usuarioBBDD
            });
        });
    });
});

// **************************************************
// DEL usuario
// **************************************************
app.delete('/:id', (request, response) => {
    var id = request.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;