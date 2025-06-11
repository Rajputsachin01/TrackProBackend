const mongoose = require("mongoose");
const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const CareerContentSchema = new mongoose.Schema(
  {
    sections: [sectionSchema],
    isPublished: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("careerContent", CareerContentSchema);
