import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const PendingModal = (props) => {
  const { open, message, children } = props;

  return (
    <Backdrop
      sx={{
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
        color: "text.secondary",
      }}
      open={open}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <CircularProgress
          sx={{ marginRight: "10px" }}
          color="primary"
          size={40}
          thickness={5}
          disableShrink
        />
        <b>{message}</b>
      </div>
      {children}
    </Backdrop>
  );
};

export default PendingModal;
