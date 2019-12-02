const { roundRobin, customAlgo } = require("../utils/balancer");
const { getClientCollection } = require('../mongo-setup');
const { getNextJob, addJobToQueue, finishJob, addJobInProcess, isSocketProcessing, updateJobToInProgress } = require('../utils/utils');

const sendJobToClient = async (io, url, socket_id, user_id) => {
  io.to(socket_id).emit("scrape", {
    url: url,
    user_id: user_id
  });
}

module.exports = function(io) {

  io.on("connect", function(socket) {
    console.log(`New socket connected ${socket.id}`);

    socket.on("call_scrape", async (data) => {
      let clients = await getClientCollection().find().toArray();
      
      
      // Run in round robin
      let client = await roundRobin(clients);

      // Run using custom algorithm
      // let client = customAlgo(clients);

      if (client !== null) {
        console.log(`Using client ${client.socket_id} to scrape url: ${data.url}`)
        // Add to job queue if client is currently processing a request, else send request to client
        let isProcessing = await isSocketProcessing(client.socket_id);
        if (!isProcessing) {
          await addJobInProcess(data.url, client.socket_id, data.user_id);
          sendJobToClient(io, data.url, client.socket_id, data.user_id);
        } else {
          await addJobToQueue(data.url, client.socket_id, data.user_id);
        }
      } else {
        console.log("No client available");
        io.to(data.user_id).emit("return_result_user", {
          result: "No clients available"
        });
      }
    })

    socket.on("return_result", async (data) => {
      console.log(`Sending to ${data.user_id}`);
      await finishJob(socket.id);
      io.to(data.user_id).emit("return_result_user", {
        result: data.result,
        powerState: data.powerState,
        totalMem: data.totalMem
      })

      let nextJob = await getNextJob(socket.id);
      if (nextJob !== null) {
        console.log("Next job queued");
        await updateJobToInProgress(nextJob.url, nextJob.socket_id, nextJob.user_id);
        sendJobToClient(io, nextJob.url, nextJob.socket_id, nextJob.user_id);
      }
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

    socket.on("disconnect", () => {
      console.log(`Client disconnected ${socket.id}`);
      let clients = getClientCollection();
      clients.deleteOne({
        socket_id: socket.id
      })
    })
  })
}