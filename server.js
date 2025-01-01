// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Register Endpoint
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  res.status(201).send('User registered');
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials');
  }
  
  user.lastLogin = new Date();
  await user.save();
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// Dashboard Endpoint
app.get('/dashboard', async (req, res) => {
  const token = req.headers['authorization'];
  
  if (!token) return res.status(403).send('Token required');
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  
  res.json(user);
});

// Forget Password Endpoint
app.post('/forget-password', async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) return res.status(404).send('User not found');
  
  // Here you would typically send an email with a reset link
  res.send('Password reset link sent');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});s