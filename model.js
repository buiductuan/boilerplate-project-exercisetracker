const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}).then(res=>{
  console.log('connected');
}).catch(err=> console.error(err));

const userSchema = new mongoose.Schema({
    username:{
      type: String,
      required: true
    }
  });
const User = mongoose.model('User', userSchema);

const exerciseSchema = new mongoose.Schema({
    username: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date
    },
});
const Exercise  = mongoose.model('Exercise', exerciseSchema);

exports.User = User;
exports.Exercise = Exercise;