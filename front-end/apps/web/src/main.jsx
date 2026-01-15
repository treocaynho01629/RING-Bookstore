import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ViteStoreProvider from "./ViteStoreProvider";
import ThemeContextProvider from "@ring/ui/ThemeContextProvider";
import SnackbarProvider from "@ring/ui/SnackbarProvider";
import i18n from "../i18n";
import { I18nextProvider } from "react-i18next";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <ViteStoreProvider>
        <ThemeContextProvider noSsr>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeContextProvider>
      </ViteStoreProvider>
    </I18nextProvider>
  </React.StrictMode>
);
