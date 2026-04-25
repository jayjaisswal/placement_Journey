const mongoose = require("mongoose");

const DailyTaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true }, // The specific date for this task
    day: { type: String }, // Monday, Tuesday, etc.
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    time: { type: String }, // HH:MM format
    completedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Index for efficient querying by user and date
DailyTaskSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("DailyTask", DailyTaskSchema);
