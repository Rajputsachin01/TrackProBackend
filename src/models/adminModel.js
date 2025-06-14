const mongoose = require("mongoose")
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
    profileImage: {
        type: String,
        default: "",
    },
    firstName: {
        type: String,
        required: true,
        default: "",
    },
    lastName: {
        type: String,
        required: true,
        default: "",
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
    otp: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, 
 { timestamps: true },
);

module.exports = mongoose.model("admin", adminSchema);