const mongoose = require("mongoose")

const BrandSchema = new mongoose.Schema({
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
