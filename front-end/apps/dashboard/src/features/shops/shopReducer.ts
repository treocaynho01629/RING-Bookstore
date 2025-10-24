import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@ring/redux";
import { setShop } from "./shopActions";

export interface ShopState {
  shop: number | undefined;
}

const initialState: ShopState = {
  shop: undefined,
};

const shopsSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setShop, (state, action) => {
      const shop = action.payload;
      state.shop = shop;
    });
  },
});

export const selectShop = (state: RootState): number | undefined =>
  state.shops.shop;

export default shopsSlice.reducer;
