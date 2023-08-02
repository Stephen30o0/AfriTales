const mongoose = require('mongoose');
const User = require('./models/User');
const Story = require('./models/Story');

mongoose.connect('mongodb://localhost:27017/african_folktales', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleStories = [
  {
    title: 'The Lion and the Mouse',
    author: 'aesop',
    content: 'Once upon a time in the jungle...',
  },
  {
    title: 'The Tortoise and the Hare',
    author: 'africanproverb',
    content: 'In the vast savannah...',
  },
  // Add more sample stories here
];

const seedDatabase = async () => {
  try {
    // Clear existing stories from the database (optional)
    await Story.deleteMany({});

    // Fetch all users from the database
    const users = await User.find({});

    // Map the users to get an object of lowercase username to user ID mappings
    const usernameToUserIdMap = users.reduce((map, user) => {
      map[user.username.toLowerCase()] = user._id;
      return map;
    }, {});

    console.log('Found users:', users);
    console.log('Username to User ID mappings:', usernameToUserIdMap);

    // Associate the user IDs with sample stories
    const sampleStoriesWithUserIds = sampleStories.map((story) => ({
      ...story,
      user: usernameToUserIdMap[story.author.toLowerCase()], // Assign the user ID to the story
    }));

    console.log('Sample stories with User IDs:', sampleStoriesWithUserIds);

    // Insert the sample stories into the database
    await Story.insertMany(sampleStoriesWithUserIds);

    console.log('Sample stories inserted successfully.');
    mongoose.connection.close(); // Close the connection after seeding
  } catch (err) {
    console.error('Error seeding the database:', err);
    mongoose.connection.close();
  }
};

seedDatabase();
