// routes/stories.js

const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Story = require('../models/Story');

// Get all stories
router.get('/stories', (req, res) => {
  // Find all stories
  Story.find()
    .then((stories) => res.json(stories))
    .catch((err) => res.status(500).json({ message: 'Failed to fetch stories', error: err }));
});

// Get a specific story by ID
router.get('/stories/:id', (req, res) => {
  const storyId = req.params.id;

  // Find the story by ID
  Story.findById(storyId)
    .then((story) => {
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }
      return res.json(story);
    })
    .catch((err) => res.status(500).json({ message: 'Failed to fetch story', error: err }));
});

// Rate a story
router.post('/stories/:id/rate', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  const { rating } = req.body;

  // Find the story by ID
  Story.findById(storyId)
    .then((story) => {
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }

      // Check if the user has already rated the story
      if (story.ratings.some((rate) => rate.user.toString() === userId)) {
        return res.status(400).json({ message: 'You have already rated this story' });
      }

      // Add the rating to the story
      story.ratings.push({ user: userId, rating });
      return story.save();
    })
    .then(() => res.json({ message: 'Story rated successfully' }))
    .catch((err) => res.status(500).json({ message: 'Failed to rate story', error: err }));
});

// Comment on a story
router.post('/stories/:id/comment', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  const storyId = req.params.id;
  const { comment } = req.body;

  // Find the story by ID
  Story.findById(storyId)
    .then((story) => {
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }

      // Add the comment to the story
      story.comments.push({ user: userId, comment });
      return story.save();
    })
    .then(() => res.json({ message: 'Comment added successfully' }))
    .catch((err) => res.status(500).json({ message: 'Failed to add comment', error: err }));
});

module.exports = router;

