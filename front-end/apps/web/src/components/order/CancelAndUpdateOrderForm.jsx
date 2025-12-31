import { Instruction } from "@ring/ui/Components";
import { useEffect, useState } from "react";
import { useCancelUnpaidOrdersMutation, useChangePaymentMethodMutation } from "../../features/orders/ordersApiSlice";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import TextField from "@mui/material/TextField";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import HelpOutline from "@mui/icons-material/HelpOutline";
import PaymentSelect from "../cart/PaymentSelect";

const cancelOptions = [
  "order.reason.address",
  "order.reason.coupon",
  "order.reason.product",
  "order.reason.payment",
  "order.reason.alternative",
  "order.reason.interested",
];

const CancelAndUpdateOrderForm = ({ id, paymentMethod, pending, setPending, handleClose, isRefund: isUpdate }) => {
  const { t } = useTranslation();

  const [value, setValue] = useState(isUpdate ? paymentMethod : cancelOptions[0]);
  const [otherReason, setOtherReason] = useState("");
  const [err, setErr] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [cancel, { isLoading: canceling }] = useCancelUnpaidOrdersMutation();
  const [changePayment, { isLoading: changing }] = useChangePaymentMethodMutation();

  useEffect(() => {
    setErr([]);
    setErrMsg("");
    setValue(isUpdate ? paymentMethod : cancelOptions[0]);
    setOtherReason("");
  }, [id, isUpdate]);

  const handleChangeMethod = (e) => {
    setValue(e.target.value);
  };

  const handleSubmit = async () => {
    if (canceling || changing || pending) return;
    setPending(true);

    const { enqueueSnackbar } = await import("notistack");

    if (isUpdate) {
      changePayment({ orderId: id, paymentMethod: value })
        .unwrap()
        .then((data) => {
          enqueueSnackbar(t("message.success", { action: t("checkout.payment.update", { ns: "authenticated" }) }), {
            variant: "success",
          });
          setErr([]);
          setErrMsg("");
          setValue(isUpdate ? paymentMethod : cancelOptions[0]);
          setOtherReason("");
          setPending(false);
          handleClose();
        })
        .catch((err) => {
          enqueueSnackbar(t("message.error", { action: t("checkout.payment.update", { ns: "authenticated" }) }), {
            variant: "error",
          });
          setErr(err);
          setErrMsg(t("checkout.payment.invalid", { ns: "authenticated" }));
          setPending(false);
        });
    } else {
      cancel({ orderId: id, reason: value ? value : otherReason })
        .unwrap()
        .then((data) => {
          enqueueSnackbar(t("message.success", { action: t("cancel.order", { ns: "authenticated" }) }), {
            variant: "success",
          });
          setErr([]);
          setErrMsg("");
          setValue(isUpdate ? paymentMethod : cancelOptions[0]);
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
        {isUpdate ? t("order.refund.title", { ns: "authenticated" }) : t("order.cancel.title", { ns: "authenticated" })}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Instruction display={errMsg ? "block" : "none"} aria-live="assertive">
            {errMsg}
          </Instruction>
          {isUpdate ? (
            <PaymentSelect
              {...{
                value,
                handleChange: handleChangeMethod,
              }}
            />
          ) : (
            <>
              <RadioGroup
                aria-labelledby="cancel-radio-buttons-group-label"
                name="radio-buttons-group"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              >
                {cancelOptions.map((option, index) => (
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
            </>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="error"
          size="large"
          autoFocus
          sx={{ mb: 1 }}
          onClick={handleClose}
          startIcon={<Close />}
        >
          {t("cancel")}
        </Button>
        <Button variant="contained" size="large" autoFocus sx={{ mb: 1 }} onClick={handleSubmit} startIcon={<Check />}>
          {t("confirm")}
        </Button>
      </DialogActions>
    </>
  );
};

export default CancelAndUpdateOrderForm;
