const { ClientsArray } = require("../objects/clientarray");

let { roundRobin } = require("../utils/utils");
let clients = new ClientsArray();

module.exports = function(io) {

  io.on("connect", function(socket) {
    console.log(`New socket connected ${socket.id}`);

    socket.on("call_scrape", (data) => {
      let client = roundRobin(clients.getClients());
      if (client != undefined) {
        console.log(`Using client ${client.socket_id} to scrape url: ${data.url}`)
        io.to(client.socket_id).emit("scrape", {
          url: data.url,
          user_id: data.user_id
        });
      } else {
        console.log("No client available");
        io.to(data.user_id).emit("return_result_user", {
          result: "No clients available"
        });
      }
    })

    socket.on("return_result", (data) => {
      console.log(`Sending to ${data.user_id}`);
      io.to(data.user_id).emit("return_result_user", {
        result: data.result
      })
    })

    socket.on("client_connect", () => {
      let id = Math.random().toString(36).substring(7);
      clients.addClient(id, socket.id);
      console.log(`Client added ${socket.id}`);
      console.log(`Clients list ${clients.getClients()}`)
    })

    socket.on("disconnect", () => {
      console.log(`Client disconnected ${socket.id}`);
      clients.removeClient(socket.id)
    })
  })
}