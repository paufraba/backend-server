// Requires
var express = require('express');
const chalk = require('chalk');
var mongoose = require('mongoose');
var setTitle = require('console-title');
var bodyParser = require('body-parser');
var cors = require('cors');


// Inicializar variables
var app = express();
const puerto = 3000;
setTitle('Servidor REST');

// CORS
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
//     next();
// });
app.use(cors());
// Activar Pre-Flight
app.options('*', cors());

//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// Conexión BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useCreateIndex: true, useNewUrlParser: true }, (err, res) => {
    if (err) {
        console.error('Conexión a la base de datos: ' + chalk.red('KO'));

        throw err;
    }

    console.log('Conexión a la base de datos: ' + chalk.green('OK'));
});

// Server index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
var appRoutes = require('./routes/mainRoute');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var loginRoutes = require('./routes/login');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);


// Escuchar peticiones
app.listen(puerto, () => {
    var timestamp = '[' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ']';
    console.log(timestamp, 'Express server arrancado en el puerto ' + chalk.blue(puerto) + ': ' + chalk.green('OK'));

})
