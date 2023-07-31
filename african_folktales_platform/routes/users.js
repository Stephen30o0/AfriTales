// routes/users.js

const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Story = require('../models/Story');

// Get all stories for a specific user
router.get('/stories', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;

  // Find all stories for the user
  Story.find({ user: userId })
    .then((stories) => res.json(stories))
    .catch((err) => res.status(500).json({ message: 'Failed to fetch stories', error: err }));
});

// Add a new story for a user
router.post('/stories', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  const { title, content } = req.body;

  // Create a new story
  const newStory = new Story({
    title,
    content,
    user: userId,
  });

  // Save the story to the database
  newStory
    .save()
    .then(() => res.json({ message: 'Story added successfully' }))
    .catch((err) => res.status(500).json({ message: 'Failed to add story', error: err }));
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

