import { createSlice } from "@reduxjs/toolkit";
import { clearShop, setShop } from "./shopActions";
import { Shop } from "../../hooks/useShop";
import type { RootState } from "@ring/redux";

export interface ShopState {
  shop: Shop;
}

const initialState: ShopState = {
  shop: { id: null, name: null },
};

const shopsSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setShop, (state, action) => {
      const { id, name } = action.payload;
      state.shop = { id: id ?? null, name: name ?? null };
    });
    builder.addCase(clearShop, (state) => {
      state.shop = { id: null, name: null };
    });
  },
});

export const selectShop = (state: RootState): Shop => state.shops.shop;

export default shopsSlice.reducer;
