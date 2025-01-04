const bcrypt = require('/bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
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
};

exports.login = async (req, res) => {
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
};

exports.forgetPassword = async (req, res) => {
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
};

