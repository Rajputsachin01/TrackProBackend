const mongoose = require("mongoose")

const DemoVideosSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: "",
    },
    isPublished: {
         type: Boolean,
        default: false
    },
    fileUrl: {
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
module.exports = mongoose.model("demoVideo", DemoVideosSchema);