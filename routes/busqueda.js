var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Inicializar variables
var app = express();

// **************************************************
// Bñusqueda general
// **************************************************
app.get('/todo/:texto', (request, response, next) => {
    var texto = request.params.texto;
    var regex = new RegExp(texto, 'i');

    Promise.all([buscarHospitales(texto, regex), buscarMedicos(texto, regex), buscarUsuarios(texto, regex)])
        .then(respuestas => {
            response.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

// **************************************************
// Búsqueda por colección
// **************************************************
app.get('/coleccion/:tabla/:texto', (request, response) => {
    var texto = request.params.texto;
    var regex = new RegExp(texto, 'i');
    var tabla = request.params.tabla;

    var promesa;

    switch (tabla) {
        case 'medico':
            promesa = buscarMedicos(texto, regex);

            break;
        case 'hospital':
            promesa = buscarHospitales(texto, regex);

            break;
        case 'usuario':
            promesa = buscarUsuarios(texto, regex);

            break;
        default:
            return response.status(400).json({
                ok: false,
                message: 'No existe la tabla ' + tabla
            });
    }

    promesa.then(data => {
        response.status(200).json({
            ok: true,
            [tabla]: data
        });
    });


});

function buscarHospitales(texto, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales)
                }
            });
    });
}

function buscarMedicos(texto, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar médicos', err);
                } else {
                    resolve(medicos)
                }
            });
    });
}

function buscarUsuarios(texto, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios)
                }
            });
    });
}

module.exports = app;