// routes/storyRoutes.js

const express = require('express');
const router = express.Router();

// Import the Story model (assuming you have defined the Story model in a separate file)
const Story = require('../models/story');

// Route for viewing a specific story
router.get('/:id', (req, res) => {
  // Retrieve the story with the specified ID from the database
  Story.findById(req.params.id)
    .then((story) => {
      if (!story) {
        // If no story is found with the specified ID, return a 404 not found response
        return res.status(404).render('error', { message: 'Story not found' });
      }

      // Render the 'story' view with the retrieved story data
      res.render('story', { story: story });
    })
    .catch((err) => {
      // Handle any errors that occur while retrieving the story from the database
      console.error('Error retrieving story:', err);
      res.status(500).render('error', { message: 'Internal Server Error' });
    });
});

// Add more routes for creating, updating, and deleting stories as needed

module.exports = router;

