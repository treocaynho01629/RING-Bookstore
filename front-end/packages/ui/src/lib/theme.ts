"use client";

import { createTheme } from "@mui/material/styles";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import darkScrollbar from "@mui/material/darkScrollbar";

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs_sm: true;
    sm_md: true;
    md_lg: true;
  }
}

export const myPalette = {
  primary: {
    main: "#63e399",
    contrastText: "#ffffff",
  },
  info: {
    main: "#63aee3",
  },
  error: {
    main: "#ef5350",
  },
  warning: {
    main: "#ffa726",
  },
  success: {
    main: "#6de363",
  },
  secondary: {
    main: "#424242",
    contrastText: "#ffffffb3",
  },
  background: {
    default: "#f9f9fb",
  },
};

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {
      palette: myPalette,
    },
    dark: {
      palette: {
        ...myPalette,
        primary: {
          main: "#63e399",
          contrastText: "#3a3a3a",
        },
        secondary: {
          main: "#d1d1d1",
          contrastText: "#0c0c0c",
        },
        text: {
          primary: "#f1f1f1",
        },
        background: {
          default: "#080d08",
          paper: "#080d08",
        },
      },
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        html: {
          ...darkScrollbar({
            track: theme.vars.palette.background.paper,
            thumb: theme.vars.palette.action.disabled,
            active: theme.vars.palette.text.primary,
          }),
          scrollbarWidth: "thin",
        },
      }),
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          display: "flex",
          alignItems: "center",
          textTransform: "none",

          "&.MuiButton-contained": {
            "&:hover": {
              backgroundColor: theme.vars.palette.grey[300],
            },

            "&:disabled": {
              backgroundColor: theme.vars.palette.grey[500],
              color: theme.vars.palette.text.disabled,
            },
          },
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down("sm")]: {
            display: "flex",
            alignItems: "center",
            padding: 10,
            height: theme.mixins.toolbar.minHeight,
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& label.Mui-focused": {
            color: theme.vars.palette.primary.dark,
          },
          "& label.Mui-error": {
            color: theme.vars.palette.error.main,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: ({ theme }) => ({
          borderColor: theme.vars.palette.divider,
        }),
        root: ({ theme }) => ({
          [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: theme.vars.palette.action.hover,
          },
          [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: theme.vars.palette.primary.main,
          },
          [`&.Mui-error .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: theme.vars.palette.error.main,
          },
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          input: {
            "input[type=number]::-webkit-outer-spin-button": {
              WebkitAppearance: "none",
            },
            "input[type=number]::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
            },
            "input[type=number]": {
              MozAppearance: "textfield",
            },
            "input[type=number]:hover, input[type=number]:focus": {
              MozAppearance: "number-input",
            },
            "&:-webkit-autofill": {
              transitionDelay: "9999s",
              transitionProperty: "all",
              WebkitBoxShadow: "0 0 0 100px #0000000 inset",
              WebkitTextFillColor: theme.vars.palette.info.main,
            },
          },
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(1),
          },
        }),
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.breakpoints.up("sm")]: {
            padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
          },
        }),
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      xs_sm: 450,
      sm: 600,
      sm_md: 768,
      md: 900,
      md_lg: 992,
      lg: 1200,
      xl: 1536,
    },
  },
});
