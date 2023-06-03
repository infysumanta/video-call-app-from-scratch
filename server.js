const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('dotenv').config();
const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
  socket.on('join', () => {
    socket.join('video-call');
    console.log('user joined');
  });

  socket.on('offer', (offer) => {
    socket.to('video-call').emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    socket.to('video-call').emit('answer', answer);
  });

  socket.on('disconnected', () => {
    socket.leave('video-call');
    console.log('user disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
