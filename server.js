const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

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
