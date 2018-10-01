var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({
    nombre: { type: 'string', required: [true, 'El nombre es obligatorio'] },
    email: { type: 'string', unique: true, required: [true, 'El email es obligatorio'] },
    password: { type: 'string', required: [true, 'La contraseña es obligatorio'] },
    img: { type: 'string', required: false },
    role: { type: 'string', required: true, default: 'USER_ROLE', enum: rolesValidos }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);
