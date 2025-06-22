const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const routes = require('./routes/index')
const app = express();
app.use(cors());
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
app.listen(PORT,()=>{
    console.log("🚀Listening to port :::",PORT)
})
