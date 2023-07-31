// routes/auth.js

const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// User registration route
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  User.findOne({ $or: [{ username }, { email }] }).then((user) => {
    if (user) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create a new user
    const newUser = new User({
      username,
      email,
      password,
    });

    // Save the user to the database
    newUser
      .save()
      .then(() => res.json({ message: 'User registered successfully' }))
      .catch((err) => res.status(500).json({ message: 'Failed to register user', error: err }));
  });
});

// User login route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Error authenticating user', error: err });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Log in the user
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in user', error: err });
      }

      return res.json({ message: 'Logged in successfully', user });
    });
  })(req, res, next);
});

module.exports = router;

