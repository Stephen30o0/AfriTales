const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

// Home Page Route
router.get('/', async (req, res) => {
  try {
    // Fetch the stories from the database
    const stories = await Story.find();

    // Assuming you are using some user authentication middleware that sets req.user
    const user = req.user;

    res.render('index', { title: 'African Folktales and Legends', user, stories });
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.render('error', { message: 'Error fetching stories' });
  }
});

// Register Page Route
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' }); // Assuming you have a register.ejs view for the register page
});

// Login Page Route
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' }); // Assuming you have a login.ejs view for the login page
});

module.exports = router;

