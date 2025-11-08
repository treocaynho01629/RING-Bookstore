import { Instruction } from "@ring/ui/Components";
import { useEffect, useState } from "react";
import { useCancelOrderMutation, useRefundOrderMutation } from "../../features/orders/ordersApiSlice";
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
  "Muốn thay đổi địa chỉ giao hàng",
  "Muốn nhập/thay đổi mã giảm giá",
  "Muốn đổi sản phẩm trong đơn hàng",
  "Muốn đổi hình thức thanh toán",
  "Tìm thấy sản phẩm rẻ hơn ở chỗ khác",
  "Đổi ý, không muốn mua nữa",
];

const refundOptions = [
  "Sản phẩm lỗi",
  "Sản phẩm khác với mô tả",
  "Sản phẩm đã qua sử dụng",
  "Sản phẩm là giả, nhái",
  "Tìm thấy sản phẩm rẻ hơn ở chỗ khác",
  "Không còn nhu cầu sử dụng (sẽ trả nguyên trạng sản phẩm)",
];

const CancelAndRefundDetailForm = ({ id, pending, setPending, handleClose, isRefund }) => {
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

  const handleSubmit = async () => {
    if (canceling || refunding || pending) return;
    setPending(true);

    const { enqueueSnackbar } = await import("notistack");

    if (isRefund) {
      refund({ id, reason: value ? value : otherReason })
        .unwrap()
        .then((data) => {
          enqueueSnackbar("Hoàn trả đơn hàng thành công!", {
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
          enqueueSnackbar("Hoàn trả đơn hàng thất bại!", { variant: "error" });
          setErr(err);
          setErrMsg("Lý do không hợp lệ!");
          setPending(false);
        });
    } else {
      cancel({ id, reason: value ? value : otherReason })
        .unwrap()
        .then((data) => {
          enqueueSnackbar("Huỷ đơn hàng thành công!", { variant: "success" });
          setErr([]);
          setErrMsg("");
          setValue(isRefund ? refundOptions[0] : cancelOptions[0]);
          setOtherReason("");
          setPending(false);
          handleClose();
        })
        .catch((err) => {
          enqueueSnackbar("Huỷ đơn hàng thất bại!", { variant: "error" });
          setErr(err);
          setErrMsg("Lý do không hợp lệ!");
          setPending(false);
        });
    }
  };

  return (
    <>
      <DialogTitle id="cancel-dialog-title" sx={{ display: "flex", alignItems: "center" }}>
        <HelpOutline />
        &nbsp;{isRefund ? "Chọn lý do hoàn trả" : "Chọn lý do huỷ đơn"}
      </DialogTitle>
      <DialogContent>
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
              <FormControlLabel key={index} value={option} label={option} control={<Radio />} />
            ))}
            <FormControlLabel value="" label="Khác" control={<Radio />} />
          </RadioGroup>
          <TextField
            placeholder="Nhập lý do khác"
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
          Huỷ
        </Button>
        <Button variant="contained" size="large" onClick={handleSubmit} startIcon={<Check />}>
          Đồng ý
        </Button>
      </DialogActions>
    </>
  );
};

export default CancelAndRefundDetailForm;
