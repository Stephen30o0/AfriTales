// seed.js

const mongoose = require('mongoose');
const User = require('./models/User');
const Story = require('./models/Story');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/african_folktales', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the sample stories
const sampleStories = [
  {
    title: 'The Lion and the Mouse',
    author: 'Aesop',
    content: 'Once upon a time in the jungle...',
  },
  {
    title: 'The Tortoise and the Hare',
    author: 'African Proverb',
    content: 'In the vast savannah...',
  },
  // Add more sample stories here
];

// Function to seed the database with sample stories
const seedDatabase = async () => {
  try {
    // Clear existing stories from the database (optional)
    await Story.deleteMany({});

    // Fetch all users from the database
    const users = await User.find({});

    // Map the users to get an array of user IDs
    const userIds = users.map((user) => user._id);

    // Associate the user IDs with sample stories
    const sampleStoriesWithUserIds = sampleStories.map((story, index) => ({
      ...story,
      user: userIds[index % userIds.length], // Assign the user ID to the story
    }));

    // Insert the sample stories into the database
    await Story.insertMany(sampleStoriesWithUserIds);

    console.log('Sample stories inserted successfully.');
    mongoose.connection.close(); // Close the connection after seeding
  } catch (err) {
    console.error('Error seeding the database:', err);
    mongoose.connection.close();
  }
};

// Call the seedDatabase function to insert sample stories
seedDatabase();


