import {
  ThemeProvider as MUIThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { theme } from "@ring/shared";

export default function ThemeContextProvider({ children }) {
  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider
        theme={theme}
        disableTransitionOnChange
        defaultMode="light"
      >
        <CssBaseline enableColorScheme />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
