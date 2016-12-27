const mongoose = require('mongoose');
const Schema = mongoose.Schema;
  
mongoose.connect('mongodb://localhost/test', (err) => {
  if (!err) {
    console.log('Connected');
  };
});

const UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, required: true, unique: true },
  password: { type: String, lowercase: true, required: true, unique: true },
});

const User = mongoose.model('User', UserSchema);

console.log('Blue');

module.exports = User;

