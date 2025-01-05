// Validation/registerValidation.js

module.exports = (req, res, next) => {
    const { username, email, password, phone } = req.body;
  
    if (!username) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Username is required.'
      });
    }
  
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
  
    if (!phone) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Phonenumber is required.'
      });
    }
  
    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Password must be at least 8 characters long.'
      });
    }
  
    // If all validations pass, call the next middleware
    next();
  };