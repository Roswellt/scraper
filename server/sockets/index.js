const { ClientsArray } = require("../objects/clientarray");

let { roundRobin } = require("../utils/utils");
let clients = new ClientsArray();

module.exports = function(io) {

  io.on("connect", function(socket) {
    console.log(`Client connected ${socket.id}`);
    let id = Math.random().toString(36).substring(7);
    clients.addClient(id, socket.id)

    socket.on("call_scrape", (data) => {
      let client = roundRobin(clients)
      console.log(clients)
      if (client != []) {
        io.to(client.socket_id).emit(
          "scrape",
          data.url
        )
      }
    })

    socket.on("disconnect", () => {
      console.log(`Client disconnected ${socket.id}`);
    })
  })
}