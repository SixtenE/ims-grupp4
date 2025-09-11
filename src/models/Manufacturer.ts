import mongoose from "mongoose";

const manufacturerModel = mongoose.model(
  "Manufacturer",
  new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    website: { type: String, required: true },
    description: { type: String, required: false },
    address: { type: String, required: false },
    contact: { type: String, required: false },
  })
);

export default manufacturerModel;
