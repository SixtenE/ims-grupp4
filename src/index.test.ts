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

describe("test GraphQL mutations", () => {
  it("should add a new product", async () => {
    const validManufacturerId = "68ce92d9ac7d8f8455134a54";

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
          manufacturerId: "68ce92d9ac7d8f8455134a54",
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
