const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const routes = require('./routes/index')
const http = require('http');
const { Server } = require('socket.io'); 
const app = express();
const server = http.createServer(app);
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
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

const url = 'mongodb+srv://devendrakandpal07:admin123@cluster0.x3zl6sc.mongodb.net/blogplatform?retryWrites=true&w=majority&appName=blogplatform';
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
const PORT = 4000;
server.listen(PORT,()=>{
    console.log("🚀Listening to port :::",PORT)
})
