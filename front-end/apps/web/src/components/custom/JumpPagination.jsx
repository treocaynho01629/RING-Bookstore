import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import AmountInput from "./AmountInput";

const JumpPagination = ({ pagination, totalPages, onPageChange, open, handleClose }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(pagination?.number + 1);

  /**
   * Handle increase page
   */
  const handleIncrease = () => {
    if (page >= totalPages) return;
    setPage((prev) => prev + 1);
  };

  /**
   * Handle decrease page
   */
  const handleDecrease = () => {
    if (page <= 1) return;
    setPage((prev) => prev - 1);
  };

  /**
   * Handle change page
   * @param {Event} e
   */
  const handleChange = (e) => {
    let newValue = e.target.value;
    if (isNaN(newValue)) newValue = "";

    if (newValue != "") {
      if (newValue < 1) newValue = 1;
      if (newValue > totalPages) newValue = totalPages;
    }

    setPage(newValue);
  };

  /**
   * Handle blur page
   */
  const handleBlur = () => {
    let newValue = page;
    if (newValue < 1) newValue = 1;
    if (newValue > totalPages) newValue = totalPages;
    setPage(newValue);
  };

  /**
   * Handle confirm page
   */
  const handleConfirm = () => {
    if (onPageChange) onPageChange(page);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} closeAfterTransition={false} aria-labelledby="pagination-dialog">
      <DialogTitle id="pagination-dialog-title">{t("pagination.jump")}</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" justifyContent="center" minWidth={250}>
          <AmountInput
            value={page}
            onChange={handleChange}
            handleDecrease={handleDecrease}
            handleIncrease={handleIncrease}
            onBlur={handleBlur}
            min={1}
            max={totalPages}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={handleClose}>
          {t("cancel")}
        </Button>
        <Button onClick={handleConfirm}>{t("confirm")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default JumpPagination;
