import { Instruction } from "@ring/ui/Components";
import { useEffect, useState } from "react";
import { useCancelOrderMutation, useRefundOrderMutation } from "../../features/orders/ordersApiSlice";
import { useTranslation } from "react-i18next";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import HelpOutline from "@mui/icons-material/HelpOutline";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import TextField from "@mui/material/TextField";

const cancelOptions = [
  "order.reason.address",
  "order.reason.coupon",
  "order.reason.product",
  "order.reason.payment",
  "order.reason.alternative",
  "order.reason.interested",
];

const refundOptions = [
  "order.reason.broken",
  "order.reason.different",
  "order.reason.used",
  "order.reason.fake",
  "order.reason.needed",
];

const CancelAndRefundDetailForm = ({ id, pending, setPending, handleClose, isRefund }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(isRefund ? refundOptions[0] : cancelOptions[0]);
  const [otherReason, setOtherReason] = useState("");
  const [err, setErr] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [cancel, { isLoading: canceling }] = useCancelOrderMutation();
  const [refund, { isLoading: refunding }] = useRefundOrderMutation();

  useEffect(() => {
    setErr([]);
    setErrMsg("");
    setValue(isRefund ? refundOptions[0] : cancelOptions[0]);
    setOtherReason("");
  }, [id, isRefund]);

  /**
   * Handle submit form
   */
  const handleSubmit = async () => {
    if (canceling || refunding || pending) return;
    setPending(true);

    const { enqueueSnackbar } = await import("notistack");

    if (isRefund) {
      refund({ id, reason: value ? t(value, { ns: "authenticated" }) : otherReason })
        .unwrap()
        .then((data) => {
          enqueueSnackbar(t("message.success", { action: t("refund.order", { ns: "authenticated" }) }), {
            variant: "success",
          });
          setErr([]);
          setErrMsg("");
          setValue(isRefund ? refundOptions[0] : cancelOptions[0]);
          setOtherReason("");
          setPending(false);
          handleClose();
        })
        .catch((err) => {
          enqueueSnackbar(t("message.error", { action: t("refund.order", { ns: "authenticated" }) }), {
            variant: "error",
          });
          setErr(err);
          setErrMsg(t("order.reason.invalid", { ns: "authenticated" }));
          setPending(false);
        });
    } else {
      cancel({ id, reason: value ? t(value, { ns: "authenticated" }) : otherReason })
        .unwrap()
        .then((data) => {
          enqueueSnackbar(t("message.success", { action: t("cancel.order", { ns: "authenticated" }) }), {
            variant: "success",
          });
          setErr([]);
          setErrMsg("");
          setValue(isRefund ? refundOptions[0] : cancelOptions[0]);
          setOtherReason("");
          setPending(false);
          handleClose();
        })
        .catch((err) => {
          enqueueSnackbar(t("message.error", { action: t("cancel.order", { ns: "authenticated" }) }), {
            variant: "error",
          });
          setErr(err);
          setErrMsg(t("order.reason.invalid", { ns: "authenticated" }));
          setPending(false);
        });
    }
  };

  return (
    <>
      <DialogTitle id="cancel-dialog-title" sx={{ display: "flex", alignItems: "center" }}>
        <HelpOutline />
        &nbsp;
        {isRefund ? t("order.refund.title", { ns: "authenticated" }) : t("order.cancel.title", { ns: "authenticated" })}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Instruction display={errMsg ? "block" : "none"} aria-live="assertive">
            {errMsg}
          </Instruction>
          <RadioGroup
            aria-labelledby="cancel-radio-buttons-group-label"
            name="radio-buttons-group"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          >
            {(isRefund ? refundOptions : cancelOptions).map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                label={t(option, { ns: "authenticated" })}
                control={<Radio />}
              />
            ))}
            <FormControlLabel value="" label={t("other")} control={<Radio />} />
          </RadioGroup>
          <TextField
            placeholder={t("order.reason.other", { ns: "authenticated" })}
            error={err?.data?.errors?.reason}
            helperText={err?.data?.errors?.reason}
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={3}
            slotProps={{
              inputComponent: TextareaAutosize,
              inputProps: {
                minRows: 3,
                style: { resize: "auto" },
              },
            }}
            sx={{ mt: 1 }}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" size="large" autoFocus onClick={handleClose} startIcon={<Close />}>
          {t("cancel")}
        </Button>
        <Button variant="contained" size="large" onClick={handleSubmit} startIcon={<Check />}>
          {t("confirm")}
        </Button>
      </DialogActions>
    </>
  );
};

export default CancelAndRefundDetailForm;
