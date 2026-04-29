import { useCallback, useState } from "react";

type ConfirmParams = {
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
};

type DialogProps = {
  open: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  handleConfirm: () => void;
  handleCancel: () => void;
};

/**
 * A hook to show a confirmation dialog
 *
 * @param ConfirmDialog - The confirmation dialog component
 * @returns The confirmation dialog component and the confirm function
 */
const useConfirm = (ConfirmDialog: React.ComponentType<DialogProps>) => {
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);
  const [options, setOptions] = useState<ConfirmParams>({
    title: "",
    message: "",
    cancelText: "Cancel",
    confirmText: "Confirm",
  });

  const confirm = useCallback(
    (title: string, message: string, cancelText: string = "Cancel", confirmText: string = "Confirm") => {
      return new Promise<boolean>((resolve) => {
        setPromise({ resolve });
        setOptions({ title, message, cancelText, confirmText });
      });
    },
    []
  );

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <ConfirmDialog
      open={promise != null}
      title={options.title}
      message={options.message}
      cancelText={options.cancelText}
      confirmText={options.confirmText}
      handleConfirm={handleConfirm}
      handleCancel={handleCancel}
    />
  );

  return { confirm, ConfirmationDialog };
};

export default useConfirm;
