const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
// category: {
//   type: [String],
//   enum: ['Productivity', 'Tips', 'Automation', 'Workflows', 'SEO', 'Trends'],
//   required: true,
// },
category: {
    type: [String],  
    required: true,
  },

  author: {
    type: String,
    default: 'Admin',
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('blog', BlogSchema);
