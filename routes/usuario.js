var express = require('express');
var bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');
var midAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();
var Usuario = require('../models/usuario');

// **************************************************
// GET usuarios
// **************************************************
app.get('/', (request, response, next) => {
    var desde = request.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (error, usuarios) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: error
                    });
                }

                Usuario.count({}, (error, cuenta) => {
                    response.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: cuenta
                    });
                });
            })
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
            usuario: usuarioBBDD,
            usuarioToken: request.usuario
        });
    });
});

// **************************************************
// PUT usuario
// **************************************************
app.put('/:id', midAutenticacion.verificaToken, (request, response) => {
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
app.delete('/:id', midAutenticacion.verificaToken, (request, response) => {
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