import { createSlice } from "@reduxjs/toolkit";
import { defaultLocale } from "@ring/i18n/locales";

const initialState = { keywords: [], lang: defaultLocale };

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    addKeyword: (state, action) => {
      if (action.payload == "") return;
      if (state.keywords.indexOf(action.payload) == -1) {
        state.keywords.push(action.payload);
      }
      if (state.keywords.length >= 13) {
        state.keywords.splice(0, 1);
      }
    },
    removeKeyword: (state, action) => {
      state.keywords = state.keywords.filter(
        (keyword) => keyword !== action.payload
      );
    },
    resetKeywords: (state) => {
      state.keywords = [];
    },
    setLanguage: (state, action) => {
      state.lang = action.payload;
    },
  },
});

export const { addKeyword, removeKeyword, resetKeywords, setLanguage } =
  appSlice.actions;
export const selectKeywords = (state) => state.app.keywords;
export const selectLanguage = (state) => state.app.lang;

export default appSlice.reducer;
