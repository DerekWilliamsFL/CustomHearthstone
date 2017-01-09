const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, required: true, unique: true },
  password: { type: String, lowercase: true, required: true, unique: true },
  likedCards: [{
    link: String,
    image: String,
    title: String,
    score: String
  }],
  dislikedCards: [{
    link: String,
    image: String,
    title: String,
    score: String
  }],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

