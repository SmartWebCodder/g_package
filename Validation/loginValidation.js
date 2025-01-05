// Validation/registerValidation.js

module.exports = (req, res, next) => {
    const { email, password, username } = req.body;

  
    if (!email) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Email is required.'
      });
    }
  
    if (!password) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Password is required.'
      });
    }
  
    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Password must be at least 8 characters long.'
      });
    }
  
    next();
  };