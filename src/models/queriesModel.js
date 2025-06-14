const mongoose = require("mongoose");

const QuerySchema = new mongoose.Schema(
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
    phoneNo: {
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
    isDemo: { type: Boolean, default: false } ,
    isRead: { type: Boolean, default: false } 
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("query", QuerySchema);
