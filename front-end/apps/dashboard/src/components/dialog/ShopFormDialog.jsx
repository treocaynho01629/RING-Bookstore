import { useState, useEffect } from "react";
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  useMediaQuery,
  Button,
  TextareaAutosize,
  Grid,
} from "@mui/material";
import {
  Check,
  Close as CloseIcon,
  AutoStories as AutoStoriesIcon,
  Person,
  Phone,
  Apartment,
  Home,
} from "@mui/icons-material";
import { location, PHONE_REGEX, getAddressType } from "@ring/shared";
import { Title } from "../custom/Components";
import { PatternFormat } from "react-number-format";
import { Instruction } from "@ring/ui";
import ImageSelect from "../custom/ImageSelect";
import { useCreateShopMutation, useUpdateShopMutation } from "../../features/shops/shopsApiSlice";

const AddressType = getAddressType();

const splitAddress = (addressInfo) => {
  let city = "";
  let ward = "";
  let address = "";

  if (addressInfo?.address) {
    //Split address
    address = addressInfo?.address;
    let addressSplit = addressInfo?.city?.split(", ");
    ward = addressSplit[addressSplit.length - 1];
    if (addressSplit.length > 1) city = addressSplit[0];
  }

  return {
    id: addressInfo?.id || "",
    name: addressInfo?.name || "",
    companyName: addressInfo?.companyName || "",
    type: addressInfo?.type || null,
    phone: addressInfo?.phone || "",
    city,
    ward,
    address,
  };
};

const ShopFormDialog = ({ open, handleClose, shop, pending, setPending }) => {
  //#region construct
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [file, setFile] = useState([]);
  const [pic, setPic] = useState(shop?.image || null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  //Address
  const [validPhone, setValidPhone] = useState(PHONE_REGEX.test(shop?.address?.phone) || true);
  const [currAddress, setCurrAddress] = useState(splitAddress(shop?.address));
  const [err, setErr] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  const [createShop, { isLoading: creating }] = useCreateShopMutation();
  const [updateShop, { isLoading: updating }] = useUpdateShopMutation();

  useEffect(() => {
    if (shop) {
      setName(shop?.name);
      setDescription(shop?.description);
      setPic(shop?.image || null);
      setCurrAddress(splitAddress(shop?.address));
      setErr([]);
      setErrMsg("");
    } else {
      clearInput();
    }
  }, [shop]);

  useEffect(() => {
    //Check phone number
    const result = PHONE_REGEX.test(currAddress.phone);
    setValidPhone(result);
  }, [currAddress.phone]);

  const clearInput = () => {
    setName("");
    setDescription("");
    setCurrAddress({
      name: "",
      companyName: "",
      type: null,
      phone: "",
      city: "",
      ward: "",
      address: "",
    });
    setErr([]);
    setErrMsg("");
  };

  const handleCloseDialog = () => {
    handleClose();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setFile([]);
    if (pic == shop?.image) {
      setPic(null);
    } else {
      setPic(shop?.image);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (creating || updating || pending) return;

    //Validation
    const isNotValid =
      !currAddress?.name ||
      !currAddress?.phone ||
      !currAddress?.address ||
      !currAddress?.city ||
      !currAddress?.ward ||
      !validPhone;
    if (isNotValid) {
      setErrMsg("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const newAddress = {
      id: currAddress.id,
      name: currAddress.name,
      companyName: currAddress.companyName,
      phone: currAddress.phone,
      city: currAddress.city + ", " + currAddress.ward,
      address: currAddress.address,
      type: currAddress.type,
    };

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    //Set data
    const formData = new FormData();
    const json = JSON.stringify({
      name,
      description,
      addressRequest: newAddress,
      image: file ? null : pic,
    });
    const blob = new Blob([json], { type: "application/json" });

    formData.append("request", blob);
    if (file?.length) formData.append("image", file[0]);

    if (shop) {
      //Update
      updateShop({ id: shop?.id, updatedShop: formData })
        .unwrap()
        .then((data) => {
          setErrMsg("");
          setErr([]);
          enqueueSnackbar("Chỉnh sửa cửa hàng thành công!", {
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
          } else if (err?.status === 417) {
            setErrMsg("File ảnh quá lớn (Tối đa 2MB)!");
          } else {
            setErrMsg("Chỉnh sửa cửa hàng thất bại!");
          }
          enqueueSnackbar("Chỉnh sửa cửa hàng thất bại!", { variant: "error" });
          setPending(false);
        });
    } else {
      //Create
      createShop(formData)
        .unwrap()
        .then((data) => {
          clearInput();
          setErrMsg("");
          setErr([]);
          enqueueSnackbar("Thêm cửa hàng thành công!", { variant: "success" });
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
          } else if (err?.status === 417) {
            setErrMsg("File ảnh quá lớn (Tối đa 2MB)!");
          } else {
            setErrMsg("Thêm cửa hàng thất bại!");
          }
          enqueueSnackbar("Thêm cửa hàng thất bại!", { variant: "error" });
          setPending(false);
        });
    }
  };
  //#endregion

  const selectedCity = location.filter((city) => {
    return city.name == currAddress?.city;
  });

  let selectWards;

  if (!selectedCity) {
    selectWards = (
      <TextField
        label="Phường/Xã"
        select
        error={(errMsg != "" || shop?.address) && !currAddress?.ward}
        defaultValue=""
        fullWidth
        slotProps={{
          select: {
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
        <MenuItem disabled value="">
          <em>--Phường/Xã--</em>
        </MenuItem>
      </TextField>
    );
  } else {
    selectWards = (
      <TextField
        label="Phường/Xã"
        required
        value={currAddress?.ward || ""}
        onChange={(e) => setCurrAddress({ ...currAddress, ward: e.target.value })}
        select
        error={(errMsg != "" || shop?.address) && !currAddress?.ward}
        defaultValue=""
        fullWidth
        slotProps={{
          select: {
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
        <MenuItem disabled value="">
          <em>--Phường/Xã--</em>
        </MenuItem>
        {selectedCity[0]?.wards?.map((ward) => (
          <MenuItem key={ward} value={ward}>
            {ward}
          </MenuItem>
        ))}
      </TextField>
    );
  }

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
        <AutoStoriesIcon />
        &nbsp;{shop ? "Chỉnh sửa cửa hàng" : "Thêm cửa hàng"}
      </DialogTitle>
      <DialogContent sx={{ pt: 0, px: { xs: 1, sm: 3 } }}>
        <form onSubmit={handleSubmit}>
          <Instruction display={errMsg ? "block" : "none"}>{errMsg}</Instruction>
          <Grid container size="grow" spacing={1}>
            <Grid size={12}>
              <Title>Thông tin cửa hàng</Title>
            </Grid>
            <Grid size={12} display="flex" justifyContent="center" py={2}>
              <ImageSelect {...{ image: pic, handleRemoveImage, file, setFile }} />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                id="title"
                label="Tên cửa hàng"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={err?.data?.errors?.title}
                helperText={err?.data?.errors?.title}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                id="description"
                label="Mô tả"
                fullWidth
                multiline
                minRows={6}
                slotProps={{
                  inputComponent: TextareaAutosize,
                  inputProps: {
                    minRows: 6,
                    style: { resize: "auto" },
                  },
                }}
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={err?.data?.errors?.description}
                helperText={err?.data?.errors?.description}
              />
            </Grid>
            <Grid size={12}>
              <Title>Địa chỉ cửa hàng</Title>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Họ và tên"
                type="text"
                id="fullName"
                required
                onChange={(e) => setCurrAddress({ ...currAddress, name: e.target.value })}
                value={currAddress?.name}
                error={((errMsg != "" || shop?.address) && !currAddress?.name) || err?.data?.errors?.name}
                helperText={err?.data?.errors?.name}
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: <Person style={{ color: "gray" }} />,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <PatternFormat
                label="Số điện thoại"
                id="phone"
                required
                onValueChange={(values) => setCurrAddress({ ...currAddress, phone: values.value })}
                value={currAddress?.phone}
                error={
                  ((errMsg != "" || shop?.address) && !currAddress?.phone) ||
                  (currAddress.phone && !validPhone) ||
                  err?.data?.errors?.phone
                }
                helperText={
                  currAddress.phone && !validPhone ? "Sai định dạng số điện thoại!" : err?.data?.errors?.phone
                }
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: <Phone style={{ color: "gray" }} />,
                  },
                }}
                format="(+84) ### ### ###"
                allowEmptyFormatting
                customInput={TextField}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tên công ty"
                type="text"
                id="company"
                onChange={(e) =>
                  setCurrAddress({
                    ...currAddress,
                    companyName: e.target.value,
                  })
                }
                value={currAddress?.companyName}
                error={err?.data?.errors?.companyName}
                helperText={err?.data?.errors?.companyName}
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: <Apartment style={{ color: "gray" }} />,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Loại địa chỉ"
                onChange={(e) => setCurrAddress({ ...currAddress, type: e.target.value })}
                select
                value={currAddress?.type || ""}
                error={err?.data?.errors?.type}
                helperText={err?.data?.errors?.type}
                fullWidth
              >
                <MenuItem value={null}>
                  <em>--Không--</em>
                </MenuItem>
                {Object.values(AddressType).map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tỉnh/Thành phố"
                required
                value={currAddress?.city || ""}
                onChange={(e) =>
                  setCurrAddress({
                    ...currAddress,
                    city: e.target.value,
                    ward: "",
                  })
                }
                select
                defaultValue=""
                error={(errMsg != "" || shop?.address) && !currAddress?.city}
                fullWidth
                slotProps={{
                  select: {
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
                <MenuItem disabled value="">
                  <em>--Tỉnh/Thành phố--</em>
                </MenuItem>
                {location.map((city) => (
                  <MenuItem key={city.name} value={city.name}>
                    {city.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>{selectWards}</Grid>
            <Grid size={12}>
              <TextField
                placeholder="Địa chỉ kho hàng"
                type="text"
                autoComplete="on"
                required
                onChange={(e) => setCurrAddress({ ...currAddress, address: e.target.value })}
                value={currAddress?.address}
                error={((errMsg != "" || shop?.address) && !currAddress?.address) || err?.data?.errors?.address}
                helperText={err?.data?.errors?.address}
                fullWidth
                multiline
                rows={2}
                slotProps={{
                  input: {
                    endAdornment: <Home style={{ color: "gray" }} />,
                  },
                }}
              />
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

export default ShopFormDialog;
