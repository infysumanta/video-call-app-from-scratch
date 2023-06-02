const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 5000;

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
