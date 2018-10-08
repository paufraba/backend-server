// Requires
var express = require('express');
const chalk = require('chalk');
var mongoose = require('mongoose');
var setTitle = require('console-title');
var bodyParser = require('body-parser')


// Inicializar variables
var app = express();
const puerto = 3000;
setTitle('Servidor REST');

//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// Conexión BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true }, (err, res) => {
    if (err) {
        console.error('Conexión a la base de datos: ' + chalk.red('KO'));

        throw err;
    }

    console.log('Conexión a la base de datos: ' + chalk.green('OK'));
});


// Rutas
var appRoutes = require('./routes/mainRoute');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var loginRoutes = require('./routes/login');
var uploadRoutes = require('./routes/upload');

app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);

app.use('/', appRoutes);


// Escuchar peticiones
app.listen(puerto, () => {
    console.log('Express server arrancado en el puerto ' + chalk.blue(puerto) + ': ' + chalk.green('OK'));

})
