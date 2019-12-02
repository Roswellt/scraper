var express = require('express');
var router = express.Router();

let io = require("socket.io-client");

const resultPromise = (socket) => {
  return new Promise((resolve, reject) => {
    socket.on("return_result_user", (data) => {
      resolve(data);
    });
  });
}

router.get('', (req, res) => {
  let socket = io.connect("https://scraper-260404.appspot.com/", {transports: ['websocket']});
  // let socket = io.connect("http://localhost:8080", {transports: ['websocket']});
  let url = req.query.url;
  socket.on("connect", () => {
    console.log(`Calling scrape ${url} for user ${socket.id}`);
    socket.emit("call_scrape", {
      url: url,
      user_id: socket.id
    })
  })

  resultPromise(socket).then(message => {
    return res.status(200).send(message)
  })
});

module.exports = router;