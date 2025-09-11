import mongoose from "mongoose";
import { ref } from "process";

const productModel = mongoose.model(
  "Product",
  new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Manufacturer",
    },
    amountInStock: { type: Number, required: true },
  })
);

export default productModel;
