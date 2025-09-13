import { Request, Response } from "express";

export async function getAllManufacturers(req: Request, res: Response) {
  res.status(200).json({ message: "getAllManufacturers" });
}
