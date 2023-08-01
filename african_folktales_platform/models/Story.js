const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  ratings: [{ rating: Number, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  comments: [{ comment: String, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;

