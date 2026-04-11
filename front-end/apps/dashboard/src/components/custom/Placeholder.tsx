import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const Placeholder = (props) => {
  const { children } = props;

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
