var express = require('express');
var router = express.Router();

let io = require("socket.io-client");
let socket = io.connect("http://localhost:8080");

router.get('/:url', (req, res) => {
  const { url } = req.params;
  console.log(`Calling scrape ${url}`)
  socket.emit("call_scrape", {
    url: url
  })

  socket.on("return_result", (data) => {
    console.log("Returned");
  })

  res.status(200).send("success");
});

module.exports = router;


