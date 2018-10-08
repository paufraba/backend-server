var express = require('express');
var fileUpload = require('express-fileupload');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var fs = require('fs');

// Inicializar variables
var app = express();

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (request, response, next) => {
    var tipo = request.params.tipo;
    var id = request.params.id;
    var tiposValisdos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValisdos.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            message: 'Tipo de colección no válida',
            errors: { message: 'Las colecciones válidas son ' + tiposValisdos.join() }
        });
    }

    if (!request.files) {
        return response.status(400).json({
            ok: false,
            message: 'No hay ficheros seleccionados'
        });
    }

    // Obtener nombre
    var archivo = request.files.imagen;
    var nombre = archivo.name.split('.');
    var ext = nombre[nombre.length - 1];

    // Extensiones válidas
    var extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];

    if (extensionesValidas.indexOf(ext) < 0) {
        return response.status(400).json({
            ok: false,
            message: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join() }
        });
    }

    // Personalizar el nombre
    var nombrePersonalizado = `${id}-${new Date().getMilliseconds()}.${ext}`;

    // Mover imágen
    var path = `./uploads/${tipo}/${nombrePersonalizado}`;

    archivo.mv(path, err => {
        if (err) {
            return response.status(400).json({
                ok: false,
                message: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombrePersonalizado, response);


    });

});

function subirPorTipo(tipo, id, nombreArchivo, response) {
    switch (tipo) {
        case 'medicos':
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

                //Borrar imagen vieja
                var oldPath = './uploads/medicos/' + medico.img;

                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath);
                }

                medico.img = nombreArchivo;
                medico.save((err, medicoBBDD) => {
                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imágen actualizada',
                        medico: medicoBBDD
                    });
                });
            });

            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: error
                    });
                }

                if (!hospital) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'El hospital con el id ' + id + ' no existe',
                        errors: { message: 'No existe un hospital con ese ID' }
                    });
                }

                //Borrar imagen vieja
                var oldPath = './uploads/hospitales/' + hospital.img;

                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath);
                }

                hospital.img = nombreArchivo;
                hospital.save((err, hospitalBBDD) => {
                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imágen actualizada',
                        hospital: hospitalBBDD
                    });
                });
            });

            break;
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (!usuario) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'El usuario con el id ' + id + ' no existe',
                        errors: { message: 'No existe un usuario con ese ID' }
                    });
                }

                //Borrar imagen vieja
                var oldPath = './uploads/usuarios/' + usuario.img;

                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath);
                }

                usuario.img = nombreArchivo;
                usuario.save((err, usuarioBBDD) => {
                    usuarioBBDD.password = ':)';

                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imágen actualizada',
                        usuario: usuarioBBDD
                    });
                });
            });

            break;
    }
}

module.exports = app;