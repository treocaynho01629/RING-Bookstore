import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setAuth, setPersist, clearAuth } from "@ring/redux/authActions";
import { RootState } from "@ring/redux";
import { redirect } from "next/navigation";

export interface AuthState {
  shop: string | null;
  persist: boolean;
}

const initialState: AuthState = {
  shop: null,
  persist: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setShop: (state, action: PayloadAction<string>) => {
      const shop = action.payload;
      state.shop = shop;
    },
  },
  extraReducers(builder) {
    builder.addCase(setAuth, (state, action) => {
      const token = action.payload;
      // state.token = token;
      // setAuthCookie(token);
    });
    builder.addCase(setPersist, (state, action) => {
      const persist = action.payload;
      state.persist = persist;
    });
    builder.addCase(clearAuth, (state, action) => {
      state.shop = null;
      state.persist = false;
      // clearAuthCookie();
      redirect("/api/auth/login");
    });
  },
});

export const { setShop } = authSlice.actions;

export const selectShop = (state: RootState): string | null => state.auth.shop;

export default authSlice.reducer;
