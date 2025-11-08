import { useState, forwardRef, useEffect } from "react";
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  useMediaQuery,
  Button,
  Grid,
} from "@mui/material";
import { Check, Close as CloseIcon, Loyalty } from "@mui/icons-material";
import { getCouponType } from "@ring/shared";
import { Title } from "../custom/Components";
import { useGetPreviewShopsQuery } from "../../features/shops/shopsApiSlice";
import { currencyFormat } from "@ring/shared";
import { NumberFormatBase, NumericFormat } from "react-number-format";
import { Instruction, DatePicker } from "@ring/ui";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { useCreateCouponMutation, useUpdateCouponMutation } from "../../features/coupons/couponsApiSlice";

const CouponType = getCouponType();

const NumericFormatCustom = forwardRef(function NumericFormatCustom(props, ref) {
  const { onChange, ...other } = props;

  const format = (numStr) => {
    if (numStr === "") return "";
    return currencyFormat.format(numStr);
  };

  return (
    <NumberFormatBase
      {...other}
      getInputRef={ref}
      onValueChange={(values, sourceInfo) => {
        let newValue = values.floatValue;

        //Threshold
        if (newValue < 0) newValue = 0;
        if (newValue > 10000000) newValue = 10000000;

        if (onChange) onChange({ target: { value: newValue } });
      }}
      format={format}
    />
  );
});

NumericFormatCustom.propTypes = { onChange: PropTypes.func.isRequired };

const CouponFormDialog = ({ coupon = null, open, handleClose, shop, pending, setPending }) => {
  //#region construct
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [code, setCode] = useState("");
  const [attribute, setAttribute] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [usage, setUsage] = useState(0);
  const [expireDate, setExpireDate] = useState(dayjs());
  const [currShop, setCurrShop] = useState(shop ?? "");
  const [openShop, setOpenShop] = useState(false);
  const [type, setType] = useState(Object.keys(CouponType)[0]);
  const [err, setErr] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  //Fetch
  const { data: shops, isLoading: loadShops } = useGetPreviewShopsQuery(
    {},
    { skip: coupon != null || (!currShop && !openShop) }
  );
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation();

  useEffect(() => {
    if (coupon) {
      setCode(coupon?.code);
      setAttribute(coupon?.attribute);
      setMaxDiscount(coupon?.maxDiscount);
      setDiscount(coupon?.discount);
      setUsage(coupon?.usage);
      setExpireDate(dayjs(coupon?.expDate));
      setType(coupon?.type);
      setCurrShop(coupon?.shopId);
      setErr([]);
      setErrMsg("");
    } else {
      clearInput();
    }
  }, [coupon]);

  const clearInput = () => {
    setCode("");
    setAttribute(0);
    setMaxDiscount(0);
    setDiscount(0);
    setUsage(0);
    setExpireDate(dayjs());
    setType(Object.keys(CouponType)[0]);
    setCurrShop(currShop);
    setErr([]);
    setErrMsg("");
  };

  const handleCloseDialog = () => {
    handleClose();
  };

  const handleOpenShops = () => {
    setOpenShop(true);
  };

  const handleDiscountChange = (e) => {
    let newValue = e.target.value;
    newValue = newValue.substring(0, newValue.length - 1) / 100;

    //Threshold
    if (newValue < 0) newValue = 0;
    if (newValue > 1) newValue = 1;

    setDiscount(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (creating || updating || pending) return;

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    //Set data
    const newCoupon = {
      discount,
      usage,
      code,
      type,
      attribute,
      maxDiscount,
      expireDate: expireDate.format("YYYY-MM-DD"),
      shopId: coupon ? coupon?.shopId : currShop,
    };

    if (coupon) {
      //Update
      updateCoupon({ id: coupon?.id, updatedCoupon: newCoupon })
        .unwrap()
        .then((data) => {
          setErrMsg("");
          setErr([]);
          enqueueSnackbar("Chỉnh sửa mã giảm giá thành công!", {
            variant: "success",
          });
          setPending(false);
          handleCloseDialog();
        })
        .catch((err) => {
          console.error(err);
          setErr(err);
          if (!err?.status) {
            setErrMsg("Server không phản hồi");
          } else if (err?.status === 409) {
            setErrMsg(err?.data?.message);
          } else if (err?.status === 403) {
            setErrMsg("Bạn không có quyền làm điều này!");
          } else if (err?.status === 400) {
            setErrMsg("Sai định dạng thông tin!");
          } else {
            setErrMsg("Chỉnh sửa mã giảm giá thất bại!");
          }
          enqueueSnackbar("Chỉnh sửa mã giảm giá thất bại!", {
            variant: "error",
          });
          setPending(false);
        });
    } else {
      //Create
      createCoupon(newCoupon)
        .unwrap()
        .then((data) => {
          clearInput();
          setErrMsg("");
          setErr([]);
          enqueueSnackbar("Thêm mã giảm giá thành công!", {
            variant: "success",
          });
          setPending(false);
        })
        .catch((err) => {
          console.error(err);
          setErr(err);
          if (!err?.status) {
            setErrMsg("Server không phản hồi");
          } else if (err?.status === 409) {
            setErrMsg(err?.data?.message);
          } else if (err?.status === 403) {
            setErrMsg("Bạn không có quyền làm điều này!");
          } else if (err?.status === 400) {
            setErrMsg("Sai định dạng thông tin!");
          } else {
            setErrMsg("Thêm mã giảm giá thất bại!");
          }
          enqueueSnackbar("Thêm mã giảm giá thất bại!", { variant: "error" });
          setPending(false);
        });
    }
  };
  //#endregion

  return (
    <Dialog
      open={open}
      scroll={"paper"}
      maxWidth={"md"}
      fullWidth
      onClose={handleCloseDialog}
      fullScreen={fullScreen}
      closeAfterTransition={false}
      aria-modal
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <Loyalty />
        &nbsp;{coupon ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"}
      </DialogTitle>
      <DialogContent sx={{ pt: 0, px: { xs: 1, sm: 3 } }}>
        <form onSubmit={handleSubmit}>
          <Instruction display={errMsg ? "block" : "none"}>{errMsg}</Instruction>
          <Grid container size="grow" spacing={1}>
            <Grid size={12}>
              <Title>Thông tin mã giảm giá</Title>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="code"
                label="Mã"
                fullWidth
                variant="outlined"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={err?.data?.errors?.code}
                helperText={err?.data?.errors?.code}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Thể loại"
                select
                required
                fullWidth
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {Object.values(CouponType).map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <Title>Chi tiết mã giảm giá</Title>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {type == CouponType.MIN_AMOUNT.value ? (
                <NumericFormat
                  required
                  id="attribute"
                  label="Số lượng tối thiểu"
                  fullWidth
                  variant="outlined"
                  value={attribute}
                  onValueChange={(values) => setAttribute(values.value)}
                  error={err?.data?.errors?.attribute}
                  helperText={err?.data?.errors?.attribute}
                  customInput={TextField}
                  allowNegative={false}
                />
              ) : (
                <TextField
                  required
                  id="attribute"
                  label="Giá tối thiểu"
                  fullWidth
                  value={attribute}
                  onChange={(e) => setAttribute(e.target.value)}
                  error={err?.data?.errors?.attribute}
                  helperText={err?.data?.errors?.attribute}
                  slotProps={{
                    input: { inputComponent: NumericFormatCustom },
                  }}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                id="maxDiscount"
                label="Giảm tối đa"
                fullWidth
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                error={err?.data?.errors?.maxDiscount}
                helperText={err?.data?.errors?.maxDiscount}
                slotProps={{
                  input: { inputComponent: NumericFormatCustom },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <NumericFormat
                required
                id="discount"
                label="% Giảm"
                fullWidth
                suffix="%"
                decimalScale={discount >= 1 ? 0 : 2}
                value={discount * 100}
                onChange={handleDiscountChange}
                error={err?.data?.errors?.discount}
                helperText={err?.data?.errors?.discount}
                customInput={TextField}
                allowNegative={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DatePicker
                required
                label="Ngày hết hạn"
                value={expireDate}
                className="custom-date-picker"
                onChange={(newValue) => setExpireDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: err?.data?.errors?.expireDate,
                    helperText: err?.data?.errors?.expireDate,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <NumericFormat
                required
                id="usage"
                label="Số lần sử dụng"
                fullWidth
                variant="outlined"
                value={usage}
                onValueChange={(values) => setUsage(values.value)}
                error={err?.data?.errors?.usage}
                helperText={err?.data?.errors?.usage}
                customInput={TextField}
                allowNegative={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="Cửa hàng"
                value={currShop || ""}
                onChange={(e) => setCurrShop(e.target.value)}
                select
                fullWidth
                disabled={coupon != null}
                error={err?.data?.errors?.shopId}
                helperText={err?.data?.errors?.shopId}
                slotProps={{
                  select: {
                    onOpen: handleOpenShops,
                    MenuProps: {
                      slotProps: {
                        paper: {
                          style: {
                            maxHeight: 250,
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem disabled>
                  <em>--Cửa hàng--</em>
                </MenuItem>
                {coupon && (
                  <MenuItem key={`shop-${coupon?.shopId}`} value={coupon?.shopId}>
                    {coupon?.shopName}
                  </MenuItem>
                )}
                {shops?.ids?.map((id, index) => {
                  const shop = shops?.entities[id];

                  return (
                    <MenuItem key={`shop-${id}-${index}`} value={id}>
                      {shop?.name}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" size="large" onClick={handleClose} startIcon={<CloseIcon />}>
          Huỷ
        </Button>
        <Button variant="contained" color="primary" size="large" onClick={handleSubmit} startIcon={<Check />}>
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CouponFormDialog;
