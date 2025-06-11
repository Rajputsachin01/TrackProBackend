const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const CookiePolicySchema = new mongoose.Schema({
  productName: { type: String, default: "TrackPro" },
  companyName: { type: String, default: "Simkraft" },
  effectiveDate: { type: Date, default: Date.now },
  sections: [sectionSchema],
  contact: {
    name: { type: String },
    location: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  isDeleted: { type: Boolean, default: false }, // to soft-disable an old policy
}, {
  timestamps: true
});

module.exports = mongoose.model("cookiePolicy", CookiePolicySchema);
