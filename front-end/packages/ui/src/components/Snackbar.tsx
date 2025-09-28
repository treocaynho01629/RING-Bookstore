import Alert from "@mui/material/Alert";
import { SnackbarContent, useSnackbar } from "notistack";
import { forwardRef, useCallback } from "react";

import type { ForwardedRef } from "react";
import type { SnackbarKey, SnackbarMessage, VariantType } from "notistack";

interface SnackbarProps {
  id: SnackbarKey;
  message: SnackbarMessage;
  variant?: VariantType;
}

const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(
  ({ id, message, variant }, ref: ForwardedRef<HTMLDivElement>) => {
    const { closeSnackbar } = useSnackbar();

    const handleCloseSnackbar = useCallback(() => {
      closeSnackbar(id);
    }, [id, closeSnackbar]);

    return (
      <SnackbarContent ref={ref}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={variant === "default" ? "info" : (variant ?? "success")}
          variant="filled"
          sx={{
            width: "100%",
            color: "white",
          }}
        >
          {message}
        </Alert>
      </SnackbarContent>
    );
  }
);

export default Snackbar;
