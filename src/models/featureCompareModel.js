const mongoose = require("mongoose");

const planFeatureSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      required: true,
      enum: ["starter", "professional"],
      unique: true
    },
    features: {
      storage: { type: Boolean, default: false },
      tasks: { type: Boolean, default: false },
      twoFactorAuth: { type: Boolean, default: false },
      collaborativeDocs: { type: Boolean, default: false },
      whiteboards: { type: Boolean, default: false },
      kanbanBoards: { type: Boolean, default: false },
      sprintManagement: { type: Boolean, default: false },
      calendarView: { type: Boolean, default: false },
      support24x7: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlanFeature", planFeatureSchema);
