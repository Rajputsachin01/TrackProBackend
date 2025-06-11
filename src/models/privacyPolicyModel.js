const mongoose = require("mongoose");
const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "",
    },
    description: {
      type: String,
      required: true,
      default: "",
    },
  },
  { _id: false }
);

const PrivacyPolicySchema = new mongoose.Schema(
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

module.exports = mongoose.model("privacyPolicy", PrivacyPolicySchema);
