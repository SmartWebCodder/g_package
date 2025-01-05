// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const User = require('./models/User');
require('dotenv').config();

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});