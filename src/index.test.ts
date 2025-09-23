import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./index.js";
import manufacturerModel from "./models/Manufacturer.js";
import productModel from "./models/Product.js";

// REST queries
describe("test rest queries", () => {
  // GET /api/products
  it("should return all products", async () => {
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // GET /api/products/:id
  it("should return a product by id", async () => {
    const validProduct = await productModel.findOne();
    if (!validProduct) {
      throw new Error("No product found in the database");
    }

    const response = await request(app).get(
      `/api/products/${validProduct._id}`
    );
    console.log(response.body._id);
    console.log(validProduct._id);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", validProduct._id.toString());
  });
  it("should return 404 for non-existing product", async () => {
    const response = await request(app).get(
      `/api/products/68d28673e1d9b9d685addac9`
    );
    expect(response.status).toBe(404);
  });
  it("should return 400 for invalid product id", async () => {
    const response = await request(app).get(`/api/products/invalid-id`);
    expect(response.status).toBe(400);
  });
  it("should return 400 for too long product id", async () => {
    const response = await request(app).get(
      `/api/products/68d28673e1d9b9d685addac968d28673e1d9b9d685addac9`
    );
    expect(response.status).toBe(400);
  });
  // GET /api/manufacturers
  it("should return all manufacturers", async () => {
    const response = await request(app).get("/api/manufacturers");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty("_id");
  });
});

// REST mutations
describe("test rest mutations", () => {
  // POST /api/products
  it("should add a new product", async () => {
    const validManufacturer = await manufacturerModel.findOne();

    if (!validManufacturer) {
      throw new Error("No manufacturer found in the database");
    }

    const testProduct = {
      name: "Test Product " + Math.floor(Math.random() * 1000),
      sku: "TESTSKU" + Math.floor(Math.random() * 1000),
      description: "A product for testing",
      price: Math.random() * 100,
      category: "Testing",
      amountInStock: 100,
      manufacturerId: validManufacturer._id,
    };

    const response = await request(app).post("/api/products").send(testProduct);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe(testProduct.name);
  });
  it("should return 400 for missing fields", async () => {
    const response = await request(app).post("/api/products").send({
      name: "Incomplete Product",
    });
    expect(response.status).toBe(400);
  });
  it("should return 400 for invalid manufacturerId", async () => {
    const response = await request(app).post("/api/products").send({
      name: "Invalid Manufacturer Product",
      sku: "INVALIDSKU",
      description: "A product with invalid manufacturerId",
      price: 19.99,
      category: "Testing",
      amountInStock: 50,
      manufacturerId: "invalid-id",
    });
    expect(response.status).toBe(400);
  });
  it("should return 409 for duplicate sku", async () => {
    const existingProduct = await productModel.findOne();
    if (!existingProduct) {
      throw new Error("No product found in the database");
    }

    const validManufacturer = await manufacturerModel.findOne();
    if (!validManufacturer) {
      throw new Error("No manufacturer found in the database");
    }

    const response = await request(app).post("/api/products").send({
      name: "Duplicate SKU Product",
      sku: existingProduct.sku,
      description: "A product with duplicate SKU",
      price: 29.99,
      category: "Testing",
      amountInStock: 30,
      manufacturerId: validManufacturer._id,
    });
    expect(response.status).toBe(409);
  });
});

// GraphQL Queries
describe("test graphql queries", () => {
  // Query products
  it("should return all products", async () => {
    const query = `
      query {
        products {
          _id
          name
          manufacturer {
            _id
            name
            contact {
              email
              phone
            }
          }
          amountInStock
        }
      }
    `;
    const response = await request(app).post("/graphql").send({ query });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data.products)).toBe(true);
    expect(response.body.data.products[0]).toHaveProperty("_id");
    expect(response.body.data.products[0]).not.toHaveProperty("sku");
  });
});

// GraphQL Mutations
describe("test graphql mutations", () => {
  // Mutation addProduct
  it("should add a new product", async () => {
    const validManufacturerId = "68d28673e1d9b9d685addac9";

    const testProductName = "Test Product " + Math.floor(Math.random() * 1000);
    const testProductSku = "TESTSKU" + Math.floor(Math.random() * 1000);

    const mutation = `
      mutation {
        addProduct(input: {
          name: "${testProductName}",
          sku: "${testProductSku}",
          description: "A product for testing",
          price: 19.99,
          category: "Testing",
          amountInStock: 100,
          manufacturerId: "${validManufacturerId}",
        }){
          _id
        }
      }
    `;

    const response = await request(app)
      .post("/graphql")
      .send({ query: mutation });

    expect(response.status).toBe(200);
    expect(response.body.data.addProduct).toHaveProperty("_id");
  });
});
