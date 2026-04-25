const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String }, // Profile picture URL
    bio: { type: String }, // User bio

    // History References (denormalized count for quick stats)
    taskHistoryCount: { type: Number, default: 0 },
    totalTasksCompleted: { type: Number, default: 0 },
    totalTasksRemoved: { type: Number, default: 0 },

    // Preferences
    theme: { type: String, enum: ["light", "dark"], default: "dark" },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", UserSchema);
