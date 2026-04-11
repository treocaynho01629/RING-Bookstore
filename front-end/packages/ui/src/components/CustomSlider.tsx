import Slider from "@mui/material/Slider";
import { styled } from "@mui/material";
import type { SliderProps } from "@mui/material/Slider";

const StyledSlider = styled(Slider)<SliderProps>(({ theme }) => ({
  "color": theme.vars?.palette.primary.main,
  "height": 8,
  "marginBottom": theme.spacing(1.5),

  "& .MuiSlider-track": {
    border: "none",
    background: "transparent",
    backgroundImage: `linear-gradient(to right, 
        ${theme.vars?.palette.primary.dark}, 
        ${theme.vars?.palette.primary.main} 50%, 
        ${theme.vars?.palette.primary.light})`,
  },

  "& .MuiSlider-thumb": {
    "height": 20,
    "width": 20,
    "backgroundColor": theme.vars?.palette.common.white,
    "border": "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&:before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    backgroundColor: theme.vars?.palette.primary.main,
  },
}));

export default function CustomSlider(props: SliderProps) {
  return <StyledSlider {...props} />;
}
