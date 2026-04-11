import { createSlice } from "@reduxjs/toolkit";
import { defaultLocale } from "@ring/shared/enums/locales";
import { RootState } from "@ring/redux";

export interface AppState {
  lang: string;
  pendingCount: number;
  pendingMessage: string;
}

const initialState: AppState = {
  lang: defaultLocale,
  pendingCount: 0,
  pendingMessage: "pending",
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.lang = action.payload;
    },
    showPending: (state, action) => {
      state.pendingCount += 1;
      const message = action.payload;
      if (typeof message === "string" && message.trim().length > 0) {
        state.pendingMessage = message;
      }
    },
    hidePending: (state) => {
      state.pendingCount = Math.max(0, state.pendingCount - 1);
      if (state.pendingCount === 0) {
        state.pendingMessage = "pending";
      }
    },
    resetPending: (state) => {
      state.pendingCount = 0;
      state.pendingMessage = "pending";
    },
  },
});

export const { setLanguage, showPending, hidePending, resetPending } = appSlice.actions;
export const selectLanguage = (state: RootState): string => state.app.lang;
export const selectPendingCount = (state: RootState): number => state.app.pendingCount;
export const selectPendingMessage = (state: RootState): string => state.app.pendingMessage;
export const selectPendingOpen = (state: RootState): boolean => state.app.pendingCount > 0;

export default appSlice.reducer;
