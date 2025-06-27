const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const routes = require('./routes/index')
const http = require('http');
const { Server } = require('socket.io'); 
const app = express();
require('dotenv').config();
const server = http.createServer(app);
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true 
}));
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // allow websocket first
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});
app.use(body_parser.json());
app.use(cookie_parser())
app.use('/v1',routes)

const url = process.env.MONGO_URI
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});
const PORT = process.env.PORT || 4000;
server.listen(PORT,()=>{
    console.log("🚀Listening to port :::",PORT)
})
