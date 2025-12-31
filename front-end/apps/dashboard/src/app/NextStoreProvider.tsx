"use client";

import { persistReducer } from "redux-persist";
import authReducer from "../features/auth/authReducer";
import shopsReducer from "../features/shops/shopReducer";
import appReducer from "../features/app/appReducer";
import StoreProvider from "@ring/redux/provider";
import storage from "redux-persist/lib/storage";

const appPersistConfig = {
  key: "app",
  version: 1,
  storage,
};

const authPersistConfig = {
  key: "auth",
  version: 1,
  storage,
};

const shopsPersistConfig = {
  key: "shops",
  version: 1,
  storage,
};

// Web reducers
const reducers = {
  app: persistReducer(appPersistConfig, appReducer),
  auth: persistReducer(authPersistConfig, authReducer),
  shops: persistReducer(shopsPersistConfig, shopsReducer),
};

const devTools = process.env.NEXT_PUBLIC_NODE_ENV === "development";

export default function NextStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider
      {...{
        reducers,
        devTools,
      }}
    >
      {children}
    </StoreProvider>
  );
}
