const mongoose = require("mongoose");
const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Free", "Paid"],
    required: true,
  },
  pricing: {
    type: String, 
  },
  durationInDays: {
    type: Number, 
    default: 0,
  },
  features: [//have to remove  _id in each item
    {
      name: String, 
      isIncluded: Boolean, 
    },
  ],
  isPublished: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Plan", PlanSchema);
