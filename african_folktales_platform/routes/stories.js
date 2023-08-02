const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Story = require('../models/Story'); 
const mongoose = require('mongoose');
const ensureAuthenticated = require('../config/auth').ensureAuthenticated;
 
console.log(ensureAuthenticated);

// Route to display all stories on the homepage
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find();
    res.render('index', { title: 'African Folktales and Legends', user: req.user, stories });
  } catch (err) {
    console.error('Error fetching stories:', err);
    req.flash('error_msg', 'An error occurred while fetching stories. Please try again.');
    res.redirect('/');
  }
});

// Create New Story Form
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('new_story', { title: 'Create New Story' });
});

// Create New Story
router.post('/new', ensureAuthenticated, async (req, res) => {
  try {
    console.log(req.user);	  
    const { title, content } = req.body;

    // Assuming the user's name is "Aesop" for this example
    const authorName = "Aesop";

    // Find the author's user object based on their name
    const authorUser = await User.findOne({ username: authorName });

    if (!authorUser) {
      // Handle the case where the author user is not found
      console.error('Author user not found');
      req.flash('error_msg', 'Author user not found');
      return res.redirect('/dashboard');
    }

    // Add the new story to the database
    const newStory = new Story({
      title,
      content,
      author: req.user._id,
      user: req.user._id, 
    });
    await newStory.save();

    req.flash('success_msg', 'Story created successfully.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error creating story:', err);
    req.flash('error_msg', 'An error occurred while creating the story. Please try again.');
    res.redirect('/dashboard');
  }
});

// View Single Story
router.get('/:id', async (req, res) => {
  try {
    const storyId = req.params.id;
    console.log('Story ID:', storyId);

    // Check if the storyId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      req.flash('error_msg', 'Invalid story ID.');
      return res.redirect('/stories');
    }

    // Find the story by its ID
    const story = await Story.findById(storyId).populate('ratings.user', 'username').populate('comments.user', 'username');
    if (!story) {
      req.flash('error_msg', 'Story not found.');
      return res.redirect('/stories');
    }

    res.render('story', { title: story.title, user: req.user, story });
  } catch (err) {
    console.error('Error fetching story:', err);
    req.flash('error_msg', 'An error occurred while fetching the story. Please try again.');
    res.redirect('/stories');
  }
});


// Submit Story Rating
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    const storyId = req.params.id;

    // Find the story by its ID
    const story = await Story.findById(storyId);
    if (!story) {
      req.flash('error_msg', 'Story not found.');
      return res.redirect('/stories/' + storyId);
    }

    // Check if the user has already rated this story
    const existingRatingIndex = story.ratings.findIndex(r => r.user.toString() === req.user._id.toString());
    if (existingRatingIndex !== -1) {
      req.flash('error_msg', 'You have already rated this story.');
      return res.redirect('/stories/' + storyId);
    }

    // Add the new rating to the story
    story.ratings.push({ user: req.user._id, rating });
    await story.save();

    req.flash('success_msg', 'Rating submitted successfully.');
    res.redirect('/stories/' + storyId);
  } catch (err) {
    console.error('Error submitting rating:', err);
    req.flash('error_msg', 'An error occurred while submitting the rating. Please try again.');
    res.redirect('/stories/' + req.params.id);
  }
});


// Submit Story Comment
router.post('/:id/comment', async (req, res) => {
  try {
    const { comment } = req.body;
    const storyId = req.params.id;

    // Find the story by its ID
    const story = await Story.findById(storyId);
    if (!story) {
      req.flash('error_msg', 'Story not found.');
      return res.redirect('/stories/' + storyId);
    }

    // Add the new comment to the story
    story.comments.push({ user: req.user._id, comment });
    await story.save();

    req.flash('success_msg', 'Comment submitted successfully.');
    res.redirect('/stories/' + storyId);
  } catch (err) {
    console.error('Error submitting comment:', err);
    req.flash('error_msg', 'An error occurred while submitting the comment. Please try again.');
    res.redirect('/stories/' + req.params.id);
  }
});

module.exports = router;

