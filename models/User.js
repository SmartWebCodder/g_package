// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountBalance: { type: Number, default: 0 },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);