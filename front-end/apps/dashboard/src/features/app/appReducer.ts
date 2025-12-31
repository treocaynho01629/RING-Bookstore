import { createSlice } from "@reduxjs/toolkit";
import { defaultLocale } from "@ring/shared/enums/locales";
import { RootState } from "@ring/redux";

export interface AppState {
  lang: string;
}

const initialState: AppState = { lang: defaultLocale };

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.lang = action.payload;
    },
  },
});

export const { setLanguage } = appSlice.actions;
export const selectLanguage = (state: RootState): string => state.app.lang;

export default appSlice.reducer;
