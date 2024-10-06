const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  invoice: String,
  price: Number,
  address: String,
  orderDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "completed", "canceled"], default: "pending" }, 
  payment: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" },
  paymentMethod:{ type: String, enum: ["Bkash", "Bank Transfer", "Cash On Delivery"], default: "Cash On Delivery" },
});

const storeSchema = new mongoose.Schema({
  storeName: { type: String, default: "Your Store" },
  storeManager: { type: String, default: "Your Store Manager" },
  storeAddress: { type: String, default: "Ex: Bahaddarhat, Chattogram" },
  storePhone: { type: String, default: "01xxx-xxxxxx" },
  storeEmail: { type: String, default: "store@example.com" },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // References to products
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" }, // Capitalized "Store"
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }], // Corrected to "Order"
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
const Store = mongoose.model("Store", storeSchema);
const Order = mongoose.model("Order", orderSchema);

module.exports = { User, Store, Order };
