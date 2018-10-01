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
