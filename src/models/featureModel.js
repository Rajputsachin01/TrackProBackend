const mongoose = require("mongoose")

const FeatureSchema = new mongoose.Schema({
     icon: {
        type: String,
        required: true,
        default: "",
    },
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
   
    isDeleted: {
        type: Boolean,
        default: false
    }
}, 
 { timestamps: true },
);
module.exports = mongoose.model("feature", FeatureSchema);