import { useEffect, useState } from "react";
import { Instruction } from "@ring/ui/Components";
import { PHONE_REGEX } from "@ring/shared/utils/regex";
import { getAddressType } from "@ring/shared/enums/address";
import { location } from "@ring/shared/utils/location";
import { PatternFormat } from "react-number-format";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Grid from "@mui/material/Grid";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Check from "@mui/icons-material/Check";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import CloseIcon from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import Apartment from "@mui/icons-material/Apartment";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

const AddressType = getAddressType();

const splitAddress = (addressInfo) => {
  let city = "";
  let ward = "";
  let address = "";

  if (addressInfo?.address) {
    // Split address
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

const AddressForm = ({
  handleClose,
  addressInfo,
  err,
  errMsg,
  setErrMsg,
  selectedValue,
  handleConvertAddress,
  pending,
  handleSetDefault,
  handleCreateAddress,
  handleClickRemove,
  handleUpdateAddress,
}) => {
  const [validPhone, setValidPhone] = useState(PHONE_REGEX.test(addressInfo?.phone) || true);
  const [currAddress, setCurrAddress] = useState(splitAddress(addressInfo));
  const [setting, setSetting] = useState(() => [addressInfo && addressInfo?.isDefault == null ? "temp" : null]);

  // Error message reset when reinput stuff
  useEffect(() => {
    setErrMsg("");
  }, [currAddress]);

  useEffect(() => {
    // Check phone number
    const result = PHONE_REGEX.test(currAddress.phone);
    setValidPhone(result);
  }, [currAddress.phone]);

  /**
   * Handle the submit event
   * @param {object} e - Event object contains the target of the submit
   * @returns {void}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;

    // Validation
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
      isDefault: addressInfo?.isDefault,
    };

    const isDefault = setting.includes("default");
    const isTemp = setting.includes("temp");

    if (!addressInfo) {
      // Create
      handleCreateAddress(newAddress, isDefault, isTemp);
    } else {
      // Update
      if (addressInfo.isDefault != null) {
        // Saved address
        isTemp ? handleConvertAddress(newAddress, isTemp) : handleUpdateAddress(newAddress, isDefault);
      } else {
        // Stored address
        isDefault
          ? handleSetDefault(newAddress)
          : isTemp
            ? handleUpdateAddress(newAddress)
            : handleConvertAddress(newAddress, isTemp);
      }
    }
  };

  /**
   * Handle the setting change event
   * @param {object} event - Event object contains the target of the setting change
   * @param {string} newValue - The new value of the setting
   * @returns {void}
   */
  const handleSettingChange = (event, newValue) => {
    setSetting(newValue);
  };

  /**
   * Get the selected city
   * @returns {object} - The selected city
   */
  const selectedCity = location.filter((city) => {
    return city.name == currAddress?.city;
  });

  // Render the select wards
  let selectWards;

  if (!selectedCity) {
    selectWards = (
      <TextField
        label="Phường/Xã"
        select
        error={(errMsg != "" || addressInfo) && !currAddress?.ward}
        defaultValue=""
        fullWidth
        size="small"
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
        error={(errMsg != "" || addressInfo) && !currAddress?.ward}
        defaultValue=""
        fullWidth
        size="small"
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

  const isSelected = selectedValue != null && selectedValue == addressInfo?.id;

  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <LocationOnIcon />
        &nbsp;Địa chỉ người nhận
      </DialogTitle>
      <DialogContent>
        <form style={{ paddingTop: 10 }} onSubmit={handleSubmit}>
          <Instruction display={errMsg ? "block" : "none"} aria-live="assertive">
            {errMsg}
          </Instruction>
          <Grid container size="grow" spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={err?.data?.errors?.name ?? "Họ và tên"}
                type="text"
                id="fullName"
                required
                onChange={(e) => setCurrAddress({ ...currAddress, name: e.target.value })}
                value={currAddress?.name}
                error={((errMsg != "" || addressInfo) && !currAddress?.name) || err?.data?.errors?.name}
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: <PersonIcon style={{ color: "gray" }} />,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <PatternFormat
                label={
                  currAddress.phone && !validPhone
                    ? "Sai định dạng số điện thoại!"
                    : (err?.data?.errors?.phone ?? "Số điện thoại")
                }
                id="phone"
                required
                onValueChange={(values) => setCurrAddress({ ...currAddress, phone: values.value })}
                value={currAddress?.phone}
                error={
                  ((errMsg != "" || addressInfo) && !currAddress?.phone) ||
                  (currAddress.phone && !validPhone) ||
                  err?.data?.errors?.phone
                }
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    endAdornment: <PhoneIcon style={{ color: "gray" }} />,
                  },
                }}
                format="(+84) ### ### ###"
                allowEmptyFormatting
                customInput={TextField}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={err?.data?.errors?.companyName ?? "Tên công ty"}
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
                size="small"
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
                label={err?.data?.errors?.type ?? "Loại địa chỉ"}
                onChange={(e) => setCurrAddress({ ...currAddress, type: e.target.value })}
                select
                value={currAddress?.type || ""}
                error={err?.data?.errors?.type}
                fullWidth
                size="small"
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
                label={err?.data?.errors?.city ?? "Tỉnh/Thành phố"}
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
                error={((errMsg != "" || addressInfo) && !currAddress?.city) || err?.data?.errors?.city}
                fullWidth
                size="small"
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
                label={err?.data?.errors?.address ?? "Địa chỉ nhận hàng"}
                type="text"
                autoComplete="on"
                required
                onChange={(e) => setCurrAddress({ ...currAddress, address: e.target.value })}
                value={currAddress?.address}
                error={((errMsg != "" || addressInfo) && !currAddress?.address) || err?.data?.errors?.address}
                fullWidth
                size="small"
                multiline
                minRows={4}
                slotProps={{
                  inputComponent: TextareaAutosize,
                  inputComponent: {
                    "aria-label": "Address textarea",
                  },
                  inputProps: {
                    minRows: 4,
                    style: { resize: "auto" },
                  },
                  input: {
                    endAdornment: <HomeIcon style={{ color: "gray" }} />,
                  },
                }}
              />
            </Grid>
            <Grid size={12} sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
              {addressInfo && !addressInfo?.isDefault && !isSelected && (
                <Button
                  disabled={addressInfo?.isDefault || isSelected}
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={() => handleClickRemove(addressInfo)}
                  aria-label="Delete button"
                >
                  Xoá&nbsp;
                  <Delete />
                </Button>
              )}
              <ToggleButtonGroup
                color="primary"
                value={setting}
                onChange={handleSettingChange}
                size="small"
                sx={{ ml: "auto" }}
                aria-label="Additional settings"
              >
                <ToggleButton
                  sx={{ px: 2, textTransform: "none", fontSize: 15 }}
                  value="default"
                  disabled={setting.includes("temp") || addressInfo?.isDefault || isSelected}
                  aria-label="Default address"
                >
                  Mặc định
                </ToggleButton>
                <ToggleButton
                  sx={{ px: 2, textTransform: "none", fontSize: 15 }}
                  value="temp"
                  disabled={setting.includes("default")}
                  aria-label="Temporary address"
                >
                  Tạm thời
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="error"
          size="large"
          onClick={handleClose}
          startIcon={<CloseIcon />}
          aria-label="Cancel button"
        >
          Huỷ
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          startIcon={<Check />}
          aria-label="Apply button"
        >
          Áp dụng
        </Button>
      </DialogActions>
    </>
  );
};

export default AddressForm;
