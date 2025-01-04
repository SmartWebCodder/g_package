const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.dashboard = async (req, res) => {
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
};
