const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    address: { type: String },
    phone: { type: String },
    store: [
      { name: { type: String } },
      { location: { type: String } },
      { manager: { type: String } },
      { email: { type: String } },
      { number: { type: String } },
    ],
    orders: [
      { userId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" } },
      { invoice: { type: String } },
      { productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" } },
      { quantity: { type: String } },
    ],
    profileImage: {
      type: String,
      default: "uploads/profile-pictures/default.png",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
