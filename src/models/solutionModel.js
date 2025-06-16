const mongoose = require("mongoose");

const solutionSchema = new mongoose.Schema(
  {
   type: {
    type: String,  
    required: true,
  },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
     isPublished: {
      type: Boolean,
      default: false,
    },
     isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("solution", solutionSchema);
