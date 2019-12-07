const dotenv = require('dotenv')
const express = require('express');
dotenv.config()

const mongo = require('./mongo-setup');
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
server.setTimeout(100000);
var io = require('socket.io').listen(server);

// Set up the sockets
socket_controller(io);

const PORT = process.env.PORT || 8080;
const ADDRESS = process.env.ADDRESS || 'localhost'

mongo.setupConnection().then(() => {
  server.listen(PORT, ADDRESS, () => {
    console.log(`App listening on  ${ADDRESS}:${PORT}`);
    console.log('Press Ctrl+C to quit.');
  })
})
