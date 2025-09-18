import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from ".";

describe("test root endpoint", () => {
  it("should return a welcome message", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    const expectedResponse = {
      message: "mongokjell",
    };
    expect(response.body).toEqual(expectedResponse);
  });
  it("should return all products", async () => {
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  it("should return an product using Id", async () => {
    const response = await request(app).get(
      "/api/products/68cbd0659223b379fa8c4677"
    );
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Nocco");
  });
  it("should return wrong product using Id", async () => {
    const response = await request(app).get(
      "/api/products/68cbd0659223b379fa8c467"
    );
    expect(response.status).toBe(400);
    expect(response.body.name).not.toBe("Nocco");
  });
  it("should create a product", async () => {
    const productData = {
      name: "Celcius",
      sku: "ijewijd8284",
      description: "Jättegott och SUPERBRA",
      price: 25,
      category: "Dryck",
      manufacturer: "68cbcdcdc4cf91f47211407b",
      amountInStock: 10,
    };
    const response = await request(app)
      .post("/api/products")
      .send(productData)
      .set("Accept", "application/json");
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe(productData.name);
  });
});
