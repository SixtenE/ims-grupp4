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
});
