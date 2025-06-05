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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("privacyPolicy", PrivacyPolicySchema);
