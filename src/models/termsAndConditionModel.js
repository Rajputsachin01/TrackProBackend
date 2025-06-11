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
     contact: {
    name: { type: String },
    location: { type: String },
    email: { type: String },
    phone: { type: String },
  },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("termsAndCondition", TermsAndConditionSchema);
