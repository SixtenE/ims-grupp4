import Product from "../models/Product.js";
import Manufacturer from "../models/Manufacturer.js";
import Contact from "../models/Contact.js";
import { faker } from "@faker-js/faker";
import { Request, Response } from "express";

export async function seedDatabase(_req: Request, res: Response) {
  await Contact.deleteMany({});
  await Manufacturer.deleteMany({});
  await Product.deleteMany({});

  const contacts = await Contact.insertMany(
    Array.from({ length: 10 }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    }))
  );

  const manufacturers = await Manufacturer.insertMany(
    Array.from({ length: 10 }).map(() => ({
      name: faker.company.name(),
      country: faker.location.country(),
      contact: faker.helpers.arrayElement(contacts)._id,
      website: faker.internet.url(),
      address: faker.location.streetAddress(),
      description: faker.lorem.sentence(),
    }))
  );

  await Product.insertMany(
    Array.from({ length: 1000 }).map(() => ({
      name: faker.commerce.productName(),
      price: faker.commerce.price(),
      manufacturer: faker.helpers.arrayElement(manufacturers)._id,
      amountInStock: faker.number.int({ min: 0, max: 100 }),
      category: faker.commerce.department(),
      description: faker.commerce.productDescription(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
    }))
  );

  res.status(200).json({ message: "👍" });
}
