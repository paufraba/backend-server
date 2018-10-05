var express = require('express');
var midAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();
var Hospital = require('../models/hospital');

// **************************************************
// GET hospitales
// **************************************************
app.get('/', (request, response, next) => {
    var desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec(
            (error, hospitales) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: error
                    });
                }

                Hospital.count({}, (error, cuenta) => {
                    response.status(200).json({
                        ok: true,
                        mensaje: 'GET de hospital',
                        hospitales: hospitales,
                        total: cuenta
                    });
                });
            })

});


// **************************************************
// POST hospital
// **************************************************
app.post('/', midAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: request.usuario._id
    });

    hospital.save((err, hospitalBBDD) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error creando hospital',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            hospital: hospitalBBDD,
            usuario: request.usuario
        });
    });
});

// **************************************************
// PUT hospital
// **************************************************
app.put('/:id', midAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error buscando hospital',
                errors: err
            });
        }

        if (!hospital) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario._id;

        hospital.save((err, hospitalBBDD) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                hospital: hospitalBBDD
            });
        });
    });
});

// **************************************************
// DEL hospital
// **************************************************
app.delete('/:id', midAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;