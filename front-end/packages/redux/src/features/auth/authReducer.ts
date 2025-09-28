import { createSlice } from "@reduxjs/toolkit";
import { setAuth, setPersist, clearAuth } from "./authActions";
import { RootState } from "../../lib/store";

export interface AuthState {
  token: string | null;
  persist: boolean;
}

const initialState: AuthState = {
  token: null,
  persist: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setAuth, (state, action) => {
      const token = action.payload;
      state.token = token;
    });
    builder.addCase(setPersist, (state, action) => {
      const persist = action.payload;
      state.persist = persist;
    });
    builder.addCase(clearAuth, (state, action) => {
      state.token = null;
      state.persist = false;
    });
  },
});

export const selectAuthToken = (state: RootState): string | null =>
  state.auth.token;
export const isPersist = (state: RootState): boolean => state.auth.persist;

export default authSlice.reducer;
