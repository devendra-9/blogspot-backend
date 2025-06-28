const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const routes = require('./routes/index')
const app = express();
require('dotenv').config();
const allowedOrigins = [process.env.CLIENT_URL]



// Always put CORS middleware at the top
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Handle preflight OPTIONS requests globally
app.options('*', cors());

// Then body parser and others
app.use(body_parser.json());
app.use(cookie_parser());
app.use(cors({
  origin: true,  // or use '*', but 'true' lets credentials work
  credentials: true
}));

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
app.listen(PORT,()=>{
    console.log("🚀Listening to port :::",PORT)
})

