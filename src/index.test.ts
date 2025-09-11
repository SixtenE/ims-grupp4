import { describe, expect, it } from "vitest";

const double = (x: number) => x * 2;

describe("double", () => {
  it("doubles a number", () => {
    expect(double(2)).toBe(4);
  });
});
