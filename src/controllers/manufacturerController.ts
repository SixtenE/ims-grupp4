import { Request, Response } from "express";

export async function getAllManufacturers(_req: Request, res: Response) {
  res.status(200).json({ message: "getAllManufacturers" });
}
