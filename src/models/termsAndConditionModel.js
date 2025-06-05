const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
      default: "",
    },
    condition: {
      type: String,
      required: true,
      default: "",
    },
  },
  { _id: false }
);

const TermsAndConditionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    sections: {
      type: [sectionSchema],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("termsAndCondition", TermsAndConditionSchema);
