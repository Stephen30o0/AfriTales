// routes/index.js

const express = require('express');
const router = express.Router();
const Story = require('../models/Story.js'); // Adjust the path to your Story model file

// Home Page Route
router.get('/', async (req, res) => {
  try {
    // Fetch the stories from the database (or wherever they are stored)
    const stories = await Story.find(); // Adjust this query according to your model schema

    // Assuming you are using some user authentication middleware that sets req.user
    const user = req.user; // This should be set by your authentication middleware

    res.render('index', { title: 'African Folktales and Legends', user, stories });
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.render('index', { title: 'African Folktales and Legends', user: null, stories: [] }); // If there's an error, pass null for user and an empty array for stories
  }
});

module.exports = router;


