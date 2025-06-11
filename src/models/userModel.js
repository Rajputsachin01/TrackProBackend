const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
     userName: {
        type: String,
    },
    name:{
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      default: "",
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      default: "",
    },
    phoneNo: {
      type: Number,
      required: true,
      default: "",
    },
       
    referralCode: {
      type: String,
      default: "",
    },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    otp: {
      type: String,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserSchema);
