const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
        type: String,
        required: true,
        default: "",
        unique: true,
        lowercase: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("subscriber", SubscriberSchema);
