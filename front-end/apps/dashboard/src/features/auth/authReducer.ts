import { createSlice } from "@reduxjs/toolkit";
import { setAuth, clearAuth } from "@ring/redux/authActions";
import { redirect } from "next/navigation";

interface AuthState {}

const initialState: AuthState = {};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setAuth, (state, action) => {});
    builder.addCase(clearAuth, (state, action) => {
      redirect("/api/auth/login");
    });
  },
});

export default authSlice.reducer;
