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
mongoose.connect(process.env.MONGODB_URI);

// Register Endpoint
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Check required fields
  if (!username || !email || !password) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Username, email, and password are required.'
    });
  }

  // Check password length
  if (password.length < 8) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Password must be at least 8 characters long.'
    });
  }

  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        statusCode: 409,
        message: 'Username or email already exists.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with userId
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    // Return success response with userId
    res.status(200).json({
      statusCode: 200,
      message: 'User Registered',
      userId: user.userId // Include userId in the response
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check required fields
  if (!username || !password) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Username and password are required.'
    });
  }

  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Invalid credentials'
    });
  }

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  // Return user details and token
  res.status(200).json({
    statusCode: 200,
    message: 'Login successful',
    userId: user.userId,
    username: user.username,
    email: user.email,
    token: token
  });
});

// Dashboard Endpoint
app.get('/dashboard', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(403).json({
      statusCode: 403,
      message: 'Token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: 'User not found'
      });
    }

    // Return user details as in the login response
    res.status(200).json({
      statusCode: 200,
      message: 'User details retrieved successfully',
      userId: user.userId,
      username: user.username,
      email: user.email,
      token: token
    });
  } catch (error) {
    return res.status(401).json({
      statusCode: 401,
      message: 'Invalid token'
    });
  }
});

// Forget Password Endpoint
app.post('/forget-password', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      statusCode: 404,
      message: 'User not found'
    });
  }

  res.status(200).json({
    statusCode: 200,
    message: 'Password reset link sent'
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});