const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String }, // Denormalized for quick access
    userAvatar: { type: String }, // User avatar
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 }, // Rating for the lecture
    type: { type: String, enum: ["comment", "review"], default: "comment" },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" }, // For nested replies
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: { type: String },
        content: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isApproved: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Index for efficient querying
CommentSchema.index({ lecture: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", CommentSchema);
