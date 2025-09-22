import { Request, Response } from "express";
import Manufacturer from "../models/Manufacturer.js";

export async function getAllManufacturers(_req: Request, res: Response) {
  try {
    const manufacturers = await Manufacturer.find();
    return res.status(200).json(manufacturers);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch manufacturers", err: error });
  }
}
