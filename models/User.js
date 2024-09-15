const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const orderSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  invoice: String,
  quantity: Number,
  price: Number,
  orderDate: { type: Date, default: Date.now },
  status: String, // e.g. 'Pending', 'Completed'
});

const storeSchema = new Schema({
  storeName: String,
  storeManager: String,
  storeAddress: String,
  storePhone: String,
  storeEmail: String,
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }], // References to products
});

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
    store: storeSchema,
    orders: [orderSchema],
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
