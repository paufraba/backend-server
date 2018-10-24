var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// **************************************************
// Verificar token
// **************************************************
exports.verificaToken = function (request, response, next) {
    var token = request.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return response.status(401).json({
                ok: false,
                mensaje: 'Token inválido',
                errors: err
            });
        }

        request.usuario = decoded.usuario;

        next();
        // response.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
}

// **************************************************
// Verificar que es Admin
// **************************************************

exports.verificaAdmin = function (request, response, next) {

    var usuario = request.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return response.status(401).json({
            ok: false,
            mensaje: 'Permiso de administrador requerido',
            errors: { message: 'Permiso de administrador requerido' }
        });
    }
}

// **************************************************
// Verificar que es Admin o es el mismo usuario
// **************************************************

exports.verificaAdminMismoUsuario = function (request, response, next) {

    var usuario = request.usuario;
    var id = request.params.id;

    console.log('ID:', id);
    console.log('Usuario ID:', usuario._id);


    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
    } else {
        return response.status(401).json({
            ok: false,
            mensaje: 'Permiso de administrador requerido 2',
            errors: { message: 'Permiso de administrador requerido' }
        });
    }
}