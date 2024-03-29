const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    enrollments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "basic",
      enum: ["basic", "instructor", "admin"],
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
