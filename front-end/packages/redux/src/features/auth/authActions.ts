import { createAction } from "@reduxjs/toolkit";

export const setAuth = createAction<string>("auth/setAuth");
export const setPersist = createAction<boolean>("auth/setPersist");
export const clearAuth = createAction("auth/clearAuth");
