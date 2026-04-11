import React from "react";
import { render, screen } from "@testing-library/react";
import { expect } from "vitest";
import Product from "../../../src/components/product/Product";

describe("Product", () => {
  it("should render placeholder", () => {
    render(<Product />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    // expect(true).toBe(true);
  });
});
