const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    quantityInStore: { type: Number },
    quantitySupplied: { type: Number },
    price: { type: Number },
    hashtagSerial: {
      type: String,
      unique: true, // Ensure it's unique
      required: true,
    },
    group: { type: String },
    packSize: { type: String },
    sdp: { type: Number },
    dp: { type: Number },
    tp: { type: Number },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
