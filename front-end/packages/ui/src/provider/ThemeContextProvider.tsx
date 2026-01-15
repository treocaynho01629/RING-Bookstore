import {
  ThemeProvider as MUIThemeProvider,
  StyledEngineProvider,
  Theme,
  ThemeProviderProps,
} from "@mui/material/styles";
import { theme as baseTheme } from "../lib/theme";
import CssBaseline from "@mui/material/CssBaseline";

interface ThemeContextProviderProps {
  theme?: Theme;
  themeProps?: ThemeProviderProps;
  children: React.ReactNode;
}

export default function ThemeContextProvider({ theme = baseTheme, children, themeProps }: ThemeContextProviderProps) {
  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider defaultMode="light" {...themeProps} theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
