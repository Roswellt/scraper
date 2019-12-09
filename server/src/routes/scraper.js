var express = require('express');
var router = express.Router();

const { DEBUG = false } = process.env

let io = require("socket.io-client");

const resultPromise = (socket) => {
  return new Promise((resolve, reject) => {
    socket.on("return_result_user", (data) => {
      resolve(data);
    });
  });
}

router.get('/', (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).send('There was no url given')
  }
  
  let socket;
  if (DEBUG === 'false') {
    socket = io.connect("https://scraper-260404.appspot.com/", {transports: ['websocket']});
  } else {
    socket = io.connect("http://localhost:8080", {transports: ['websocket']});
  }

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