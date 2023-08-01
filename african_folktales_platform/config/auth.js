module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      // Ensure that the user object has the "stories" property
      if (!req.user.stories) {
        req.user.stories = []; // If stories array is not defined, set it to an empty array
      }
      return next();
    }
    res.redirect('/login');
  },
  ensureGuest: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard');
    } else {
      return next();
    }
  },
};

