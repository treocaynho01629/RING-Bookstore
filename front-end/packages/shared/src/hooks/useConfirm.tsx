import { useState } from "react";
import type { FC } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

type UseConfirmReturn = [FC, () => Promise<boolean>];

/**
 * A hook to show a confirmation dialog
 *
 * @param title - The title of the confirmation dialog
 * @param message - The message of the confirmation dialog
 * @returns A tuple containing the confirmation dialog component and the confirm function
 */
const useConfirm = (title?: string, message?: string): UseConfirmReturn => {
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = () =>
    new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });

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

  const ConfirmationDialog: FC = () => (
    <ConfirmDialog
      {...{
        open: promise !== null,
        title,
        message,
        handleConfirm,
        handleCancel,
      }}
    />
  );

  return [ConfirmationDialog, confirm];
};

export default useConfirm;
