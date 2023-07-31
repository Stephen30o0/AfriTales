// app.js

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');

// Initialize Express application
const app = express();

// Middleware for body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static files
app.use(express.static('public'));

// Express session middleware
app.use(
  session({
    secret: 'secret_key',
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash middleware
app.use(flash());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/african_folktales', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB', err));

// Passport configuration
require('./config/passport')(passport);

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

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/stories', require('./routes/stories'));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

