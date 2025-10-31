"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "../lib/store";
import { PersistGate } from "redux-persist/integration/react";
import { combineReducers, ReducersMapObject } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import { injectStore } from "./storeRef";
import apiSlice, { setBaseUrl } from "../lib/apiSlice";

// Static reducer
const staticReducer: ReducersMapObject = {
  [apiSlice.reducerPath]: apiSlice.reducer,
};

export default function StoreProvider({
  children,
  reducers,
  baseUrl,
  devTools,
}: {
  children: React.ReactNode;
  reducers?: ReducersMapObject | undefined;
  baseUrl?: string;
  devTools?: boolean;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore(undefined, devTools);
    injectStore(storeRef.current);
  }

  // Change base url
  if (reducers && baseUrl) setBaseUrl(baseUrl);

  // Replace/inject reducers
  storeRef.current.replaceReducer(
    combineReducers({ ...staticReducer, ...reducers })
  );

  const persistor = persistStore(storeRef.current);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
