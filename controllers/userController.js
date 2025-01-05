const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const registerValidation = require('../Validation/registerValidation');
const loginValidation = require('../Validation/loginValidation');

exports.register = async (req, res) => {
    registerValidation(req, res, async () => {
        const { username, email, password, phone } = req.body;
  
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
      const user = new User({ username, email, password: hashedPassword, phone });
      await user.save();
  
      // Return success response with userId
      res.status(200).json({
        statusCode: 200,
        message: 'User Registered',
        userId: user.userId 
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error'
      });
    }
    
    });
};

exports.login = async (req, res) => {
    loginValidation(req, res, async () => {
        const {email, password } = req.body;

  const user = await User.findOne({ email });
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
    phone: user.phone,
    email: user.email,
    token: token
  });

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

