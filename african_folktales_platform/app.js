// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const methodOverride = require('method-override');
const storiesRouter = require('./routes/stories');
const Story = require('./models/Story');

// Load environment variables from .env file
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/african_folktales', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB', err));

// Passport configuration
require('./config/passport')(passport);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Add the express-session middleware here
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Set up global variables for flash messages and user
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');

  // Set the user variable to the currently logged-in user (if available)
  res.locals.user = req.user || null;

  next();
});

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/stories', require('./routes/stories'));

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to view this resource.');
  res.redirect('/users/login');
};

// Route to handle displaying all public stories
app.get('/dashboard', async (req, res) => {
  try {
    const publicStories = await Story.find({}).populate('user');
    res.render('dashboard', { stories: publicStories });
  } catch (err) {
    console.error('Error fetching stories:', err);
    req.flash('error_msg', 'Error fetching stories. Please try again later.');
    res.redirect('/');
  }
});

// Route to display a single story
app.get('/stories/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('user');
    if (!story) {
      req.flash('error_msg', 'Story not found.');
      return res.redirect('/dashboard');
    }
    res.render('story', { story });
  } catch (err) {
    console.error('Error fetching the story:', err);
    req.flash('error_msg', 'Error fetching the story. Please try again later.');
    res.redirect('/dashboard');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

