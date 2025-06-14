const mongoose = require("mongoose")

const BrandSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        default: "",
    },
    logo: {
        type: String,
        required: true,
        default: "",
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, 
 { timestamps: true },
);
module.exports = mongoose.model("brand", BrandSchema);
