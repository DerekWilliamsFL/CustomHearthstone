var mongoose = require('mongoose');
var crypto = require('crypto');

var UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, required: true, unique: true },
  hash: String,
  salt: String,
  favorites: []
});

mongoose.model('User', UserSchema);

UserSchema.methods.setPassword = (password) => {
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
}
