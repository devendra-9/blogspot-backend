const mongoose = require('mongoose')

const userPosts = new mongoose.Schema({
    user_id: {type:mongoose.Schema.Types.ObjectId, required:true},
    title:{type:String, required:true},
    body:{type:String, required:true},
    createdAt:{type: Date, default: Date.now},
    isdeleted:{type:Boolean, deault:false}
})

const posts = new mongoose.model('posts',userPosts)
module.exports = posts