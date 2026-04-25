const mongoose = require("mongoose");

const TaskHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    category: { type: String },
    status: {
      type: String,
      enum: ["completed", "removed"],
      default: "completed",
    },
    originalTaskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    dueDate: { type: Date },
    completedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Index for efficient querying
TaskHistorySchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model("TaskHistory", TaskHistorySchema);
