var express = require('express');
var router = express.Router();

let io = require("socket.io-client");
let socket = io.connect("https://scraper-260404.appspot.com/", {transports: ['websocket']});
// let socket = io.connect("http://localhost:8080", {transports: ['websocket']});

const resultPromise = () => {
  return new Promise((resolve, reject) => {
    socket.on("return_result_user", (data) => {
      resolve(data);
    });
  });
}

router.get('/*', (req, res) => {
  // Since params are URLs which can contain slashes, use * wildcard to get <URL> from scraper-job/<URL>
  const url = req.params[0];
  console.log(`Calling scrape ${url} for user ${socket.id}`);
  socket.emit("call_scrape", {
    url: url,
    user_id: socket.id
  })

  resultPromise().then(message => {
    return res.status(200).send(message)
  })
});

module.exports = router;