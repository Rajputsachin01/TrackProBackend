const mongoose = require("mongoose")

const UseCaseSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        default: "",
    },
    works: {
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
module.exports = mongoose.model("useCase", UseCaseSchema);