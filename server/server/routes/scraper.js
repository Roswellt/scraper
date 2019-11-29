var express = require('express');
var router = express.Router();

let io = require("socket.io-client");
let socket = io.connect("http://localhost:8080");

const resultPromise = () => {
  return new Promise((resolve, reject) => {
    socket.on("return_result_user", (data) => {
      resolve(data);
    });
  });
}

router.get('/:url', (req, res) => {
  const { url } = req.params;
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