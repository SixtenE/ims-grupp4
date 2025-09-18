import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from ".";

describe("test rest endpoint", () => {
  it("should return all products", async () => {
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe("test graphql endpoint", () => {
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
