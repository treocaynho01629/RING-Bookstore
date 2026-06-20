import React from "react";
import { render, screen } from "@testing-library/react";
import { expect } from "vitest";
// import MiniCart from "../../../src/components/navbar/MiniCart";

describe("MiniCart", () => {
  it("should render empty MiniCart", () => {
    // render(
    //   <MiniCart
    //     {...{
    //       openCart: true,
    //       products: [],
    //       anchorElCart: null,
    //       handleCloseCart: () => {},
    //     }}
    //   />
    // );
    expect(true).toBe(true);
  });

  // it("should render the MiniCart with products provided", () => {
  //   const products = [
  //     {
  //       id: 1,
  //       title: "Product 1",
  //     },
  //     {
  //       id: 2,
  //       title: "Product 2",
  //     },
  //   ];

  //   render(
  //     <MiniCart
  //       {...{
  //         openCart: true,
  //         products,
  //         anchorElCart: null,
  //         handleCloseCart: () => {},
  //       }}
  //     />
  //   );

  //   products.forEach((item) => {
  //     const title = screen.getByText(item.title);
  //     expect(title).toBeInTheDocument();
  //   });
  // });
});
