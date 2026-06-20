import Box, { type BoxProps } from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const Placeholder = ({ children, ...props }: BoxProps) => {

  return (
    <Box position="relative" width="100%" height="100%" {...props}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="primary" size={40} thickness={5} />
      </Box>
      {children != null && <Box visibility="hidden">{children}</Box>}
    </Box>
  );
};

export default Placeholder;
