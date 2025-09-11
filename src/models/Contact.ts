import mongoose from "mongoose";

const contactModel = mongoose.model(
  "Contact",
  new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  })
);

export default contactModel;
