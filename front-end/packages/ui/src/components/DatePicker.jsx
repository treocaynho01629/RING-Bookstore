import FormControl from "@mui/material/FormControl";
import { styled } from "@mui/material/styles";
import { viVN } from "@mui/x-date-pickers/locales";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import localeVi from "dayjs/locale/vi";

const StyledDatePicker = styled(MuiDatePicker)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: 0,
  },
  "& label.Mui-focused": {
    color: theme.vars.palette.action.focus,
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: theme.vars.palette.action.focus,
  },
  "& .MuiOutlinedInput-root": {
    "borderRadius": 0,
    "& fieldset": {
      borderRadius: 0,
      borderColor: theme.vars.palette.action.focus,
    },
    "&:hover fieldset": {
      borderRadius: 0,
      borderColor: theme.vars.palette.action.hover,
    },
    "&.Mui-focused fieldset": {
      borderRadius: 0,
      borderColor: theme.vars.palette.action.focus,
    },
  },
  "& input:valid + fieldset": {
    borderColor: theme.vars.palette.action.focus,
    borderRadius: 0,
    borderWidth: 1,
  },
  "& input:invalid + fieldset": {
    borderColor: theme.vars.palette.error.main,
    borderRadius: 0,
    borderWidth: 1,
  },
  "& input:valid:focus + fieldset": {
    borderColor: theme.vars.palette.primary.main,
    borderLeftWidth: 4,
    borderRadius: 0,
    padding: "4px !important",
  },
}));

const DatePicker = (props) => {
  const { margin, locale } = props;

  return (
    <LocalizationProvider
      localeText={locale === "vi" ? viVN.components.MuiLocalizationProvider.defaultProps.localeText : null}
      dateAdapter={AdapterDayjs}
      adapterLocale={locale ?? "vi"}
    >
      <FormControl margin={margin ? margin : "none"} fullWidth>
        <StyledDatePicker {...props} />
      </FormControl>
    </LocalizationProvider>
  );
};

export default DatePicker;
