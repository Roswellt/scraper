let { roundRobin, customAlgo, pabfd } = require("../utils/utils");
let { getRRCount, getClientCollection } = require('../mongo-setup');

const {ALGORITHM} = process.env

module.exports = function(io) {

  io.on("connect", function(socket) {
    console.log(`New socket connected ${socket.id}`);

    socket.on("call_scrape", async (data) => {
      let clients = await getClientCollection().find().toArray();
      
      let client = null;

      if (ALGORITHM === 'CUSTOM') {
        // Run using custom algorithm
        client = customAlgo(clients);
      } else if (ALGORITHM === 'PABFD') {
        // run using power aware bast fit decreasing
        client = pabfd(data, clients)
      } else {
        // Run in round robin
        let counter = await getRRCount();
        client = roundRobin(clients, counter.value);
      }

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
        result: data.results,
        powerState: data.powerState,
        totalMem: data.totalMem
      })
    })

    socket.on("client_connect", (data) => {
      let clients = getClientCollection();
      let id = Math.random().toString(36).substring(7);
      clients.insertOne({
        id: id,
        socket_id: socket.id,
        powerState: data.powerState,
        totalMem: data.totalMem
      })
      console.log(`Client added ${socket.id}`);
      console.log(`Clients list ${clients.find()}`)
    })

    socket.on("update_battery", (data) => {
      let clients = getClientCollection();
      clients.updateOne({
        socket_id: socket.id
      }, { $set: {
        powerState: data.powerState
      }})
    })

    socket.on("disconnect", () => {
      console.log(`Client disconnected ${socket.id}`);
      let clients = getClientCollection();
      clients.deleteOne({
        socket_id: socket.id
      })
    })
  })
}