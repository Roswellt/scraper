const { ClientsArray } = require("../objects/clientarray");

let { roundRobin } = require("../utils/utils");
let clients = new ClientsArray();

module.exports = function(io) {

  io.on("connect", function(socket) {
    console.log(`New socket connected ${socket.id}`);

    socket.on("call_scrape", (data) => {
      let client = roundRobin(clients.getClients());
      if (client != []) {
        io.emit("scrape");
      }
    })

    socket.on("client_connect", () => {
      let id = Math.random().toString(36).substring(7);
      clients.addClient(id, socket.id);
      // console.log("Client joining room");
      // socket.join("clients");
    })

    socket.on("disconnect", () => {
      console.log(`Client disconnected ${socket.id}`);
    })
  })
}