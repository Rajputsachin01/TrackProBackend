const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    problem: {
      type: String,
      trim: true
    },
    solution: {
      type: String,
      trim: true
    },
    outcome: {
      type: String,
      trim: true
    },
    pdf: {
      type: String, // Can be a URL or file path to the PDF
      required: false,
      trim: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('caseStudy', caseStudySchema);
