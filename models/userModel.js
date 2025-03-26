import mongoose from "mongoose";

import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: String,
  email: String,
  role: {
    type: String,
    default: "User",
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
