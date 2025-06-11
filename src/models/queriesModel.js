const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      trim: true,
      default : ""
    },
    name: {
      type: String,
      trim: true,
      default : ""

    },
    email: {
      type: String,
      trim: true,
      default : ""

    },
    phone: {
      type: String,
      trim: true,
      
    },
    companyName: {
      type: String,
      trim: true,
      default : ""

    },
    message: {
      type: String,
      trim: true,
      default : ""

    },
    isRead: { type: Boolean, default: false }  // 👈 New field

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Query", querySchema);
