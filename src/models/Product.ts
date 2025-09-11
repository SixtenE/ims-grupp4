import mongoose from "mongoose";

const productModel = mongoose.model(
  "Product",
  new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    manufacturer: { type: String, required: true },
    amountInStock: { type: Number, required: true },
  })
);

export default productModel;
