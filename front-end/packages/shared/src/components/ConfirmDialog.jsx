import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// TODO: Move this
const ConfirmDialog = ({ open, title, message, handleConfirm, handleCancel, maxWidth = "xs", ...props }) => {
  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth={maxWidth}
      closeAfterTransition={false}
      aria-labelledby="confirmation-dialog"
      {...props}
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent dividers={props?.scroll === "paper"}>
        <DialogContentText sx={{ whiteSpace: "pre-line" }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {handleCancel && (
          <Button color="error" autoFocus onClick={handleCancel}>
            Huỷ
          </Button>
        )}
        {handleConfirm && (
          <Button color="primary" onClick={handleConfirm}>
            Đồng ý
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
