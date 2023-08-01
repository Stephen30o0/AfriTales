const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');
const Story = require('../models/Story');

// User Registration Form
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// User Registration
router.post('/register', (req, res) => {
  console.log(req.body);  
  const { name, email, username, password, password2 } = req.body;


  // Validation checks
  const errors = [];
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', { title: 'Register', errors, name, email });
  } else {
    // Validation passed, check if user already exists
    User.findOne({ email: email })
      .then((user) => {
        if (user) {
          errors.push({ msg: 'Email is already registered' });
          res.render('register', { title: 'Register', errors, name, email });
        } else {
          // Create a new user
          const newUser = new User({
            name,
            email,
	    username,  
            password,
          });

          // Hash password before saving
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              // Save the user to the database
              newUser
                .save()
                .then(() => {
                  req.flash('success_msg', 'You are now registered and can log in');
                  res.redirect('/users/login');
                })
                .catch((err) => console.error(err));
            });
          });
        }
      })
      .catch((err) => console.error(err));
  }
});

// User Login Form
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// User Login
router.post('/login',passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
}));

// User Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  // Fetch user's stories
  Story.find({ user: req.user.id })
    .then((stories) => {
      // Render the dashboard view and pass the user and stories data to the template
      res.render('dashboard', {
        title: 'Dashboard',
        user: req.user,
        stories: stories,
      });
    })
    .catch((err) => {
      // Handle any errors that occur during the database query (optional)
      console.error('Error fetching stories:', err);
      res.status(500).json({ message: 'Failed to fetch stories', error: err });
    });
});

// Get all stories for a specific user
router.get('/stories', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;

  // Find all stories for the user
  Story.find({ user: userId })
    .then((stories) => res.json(stories))
    .catch((err) => res.status(500).json({ message: 'Failed to fetch stories', error: err }));
});

// Create New Story Form
router.get('/stories/new', ensureAuthenticated, (req, res) => {
  res.render('new_story', { title: 'Create New Story' });
});

// Create New Story
router.post('/stories/new', ensureAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;

    // Create a new story
    const newStory = new Story({
      title,
      content,
      author: req.user.username, // Assuming the user's username is stored in req.user.username
      user: req.user._id, // Assuming the user's ID is stored in req.user._id
    });

    // Save the story to the database
    await newStory.save();

    req.flash('success_msg', 'Story created successfully.');
    res.redirect('/dashboard'); // Redirect to the dashboard after creating the story
  } catch (err) {
    console.error('Error creating story:', err);
    req.flash('error_msg', 'An error occurred while creating the story. Please try again.');
    res.redirect('/users/stories/new');
  }
});

// Update a story for a user
router.put('/stories/:id', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  const { title, content } = req.body;

  // Find the story by ID
  Story.findById(storyId)
    .then((story) => {
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }

      // Check if the user owns the story
      if (story.user.toString() !== userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Update the story
      story.title = title;
      story.content = content;
      return story.save();
    })
    .then(() => res.json({ message: 'Story updated successfully' }))
    .catch((err) => res.status(500).json({ message: 'Failed to update story', error: err }));
});

// Delete a story for a user
router.delete('/stories/:id', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;

  // Find the story by ID
  Story.findById(storyId)
    .then((story) => {
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }

      // Check if the user owns the story
      if (story.user.toString() !== userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Delete the story
      return story.remove();
    })
    .then(() => res.json({ message: 'Story deleted successfully' }))
    .catch((err) => res.status(500).json({ message: 'Failed to delete story', error: err }));
});

module.exports = router;

