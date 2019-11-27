const port = 8080;

const express = require('express');

let route_controller = require('./routes/route_controller');
let socket_controller = require('./sockets');

var app = express();

// set view engine
app.set('view engine', 'ejs');

// set up static routes for JS and CSS
app.use(express.static('./public'));

// Set up routes
route_controller(app);

var server = require('http').Server(app);
var io = require('socket.io').listen(server);

// Set up the sockets
socket_controller(io);

server.listen(port, () => console.log(`App listening on http://localhost:${port}`));
