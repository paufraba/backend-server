var express = require('express');
var midAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();
var Medico = require('../models/medico');

// **************************************************
// GET medicos
// **************************************************
app.get('/', (request, response, next) => {
    var desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec(
            (error, medicos) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: error
                    });
                }

                Medico.count({}, (error, cuenta) => {
                    response.status(200).json({
                        ok: true,
                        mensaje: 'GET de medicos',
                        medicos: medicos,
                        total: cuenta
                    });
                });
            })
});


// **************************************************
// POST medico
// **************************************************
app.post('/', midAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: request.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoBBDD) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error creando medico',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            medico: medicoBBDD,
            usuario: request.usuario
        });
    });
});

// **************************************************
// PUT medico
// **************************************************
app.put('/:id', midAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error buscando médico',
                errors: err
            });
        }

        if (!medico) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = request.usuario._id;

        medico.save((err, medicoBBDD) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                medico: medicoBBDD
            });
        });
    });
});

// **************************************************
// DEL medico
// **************************************************
app.delete('/:id', midAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        response.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;