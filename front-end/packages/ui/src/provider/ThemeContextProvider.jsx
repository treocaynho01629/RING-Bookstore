import { ThemeProvider as MUIThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { theme as baseTheme } from "../lib/theme";
import CssBaseline from "@mui/material/CssBaseline";

export default function ThemeContextProvider({ theme, children }) {
  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme ?? baseTheme} disableTransitionOnChange defaultMode="light">
        <CssBaseline enableColorScheme />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
