import { useCallback, useEffect, useMemo, useState } from "react";
import { Instruction } from "@ring/ui/Components";
import { PHONE_REGEX } from "@ring/shared/utils/regex";
import { addressTypeOptions } from "@ring/shared/enums/address";
import { useTranslation } from "react-i18next";
import { PatternFormat } from "react-number-format";
import { ghnApiSlice } from "../../features/ghn/ghnApiSlice";
import { capitalize } from "lodash";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Check from "@mui/icons-material/Check";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CloseIcon from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import Apartment from "@mui/icons-material/Apartment";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

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
  const { t } = useTranslation();
  const [validPhone, setValidPhone] = useState(PHONE_REGEX.test(addressInfo?.phone) || true);
  const [currAddress, setCurrAddress] = useState({
    id: addressInfo?.id || "",
    name: addressInfo?.name || "",
    companyName: addressInfo?.companyName || "",
    type: addressInfo?.type || null,
    phone: addressInfo?.phone || "",
    address: addressInfo?.address || "",
    provinceId: addressInfo?.provinceId ?? null,
    districtId: addressInfo?.districtId ?? null,
    wardCode: addressInfo?.wardCode ?? null,
    detail: addressInfo?.detail || "",
  });
  const [setting, setSetting] = useState(() => [addressInfo && addressInfo?.isDefault == null ? "temp" : null]);
  const [selectedGhn, setSelectedGhn] = useState({
    province: addressInfo?.provinceId ?? null,
    district: addressInfo?.districtId ?? null,
    ward: addressInfo?.wardCode ?? null,
  });

  const [getProvinces, { data: provinces, isLoading: loadingProvinces }] = ghnApiSlice.useLazyGetProvincesQuery();
  const provinceList = provinces?.ids?.map((id) => provinces?.entities[id]).filter(Boolean) ?? [];
  const [getDistricts, { data: districts, isLoading: loadingDistricts }] = ghnApiSlice.useLazyGetDistrictsQuery();
  const districtList = districts?.ids?.map((id) => districts?.entities[id]).filter(Boolean) ?? [];
  const [getWards, { data: wards, isLoading: loadingWards }] = ghnApiSlice.useLazyGetWardsQuery();
  const wardList = wards?.ids?.map((id) => wards?.entities[id]).filter(Boolean) ?? [];

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
      !currAddress?.name || !currAddress?.phone || !currAddress?.address || !currAddress?.detail || !validPhone;
    if (isNotValid) {
      setErrMsg(t("validation.error.form.required", { ns: "validation" }));
      return;
    }

    const newAddress = {
      id: currAddress.id,
      name: currAddress.name,
      companyName: currAddress.companyName,
      phone: currAddress.phone,
      address: currAddress.address,
      detail: currAddress.detail,
      provinceId: currAddress.provinceId,
      districtId: currAddress.districtId,
      wardCode: currAddress.wardCode,
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

  const step = !selectedGhn.province
    ? "province"
    : !selectedGhn.district
      ? "district"
      : !selectedGhn.ward
        ? "ward"
        : "done";

  /**
   * Return the options for the autocomplete
   * @returns {array} - The options for the autocomplete
   */
  const options = useMemo(() => {
    if (step === "province") return provinceList;
    if (step === "district") return districtList;
    if (step === "ward") return wardList;
    return [];
  }, [districtList, provinceList, step, wardList]);

  /**
   * Return the label for the step
   * @param {object} opt - The option for the autocomplete
   * @returns {string} - The label for the step
   */
  const getLabelForStep = useCallback(
    (opt) => {
      if (typeof opt !== "object" || !opt) return "";
      if (step === "province") return opt?.ProvinceName ?? "";
      if (step === "district") return opt?.DistrictName ?? "";
      if (step === "ward") return opt?.WardName ?? "";
      return "";
    },
    [step]
  );

  /**
   * Handle the clear event for the autocomplete
   * @returns {void}
   */
  const handleClear = useCallback(() => {
    setSelectedGhn({ province: null, district: null, ward: null });
    setCurrAddress((prev) => ({ ...prev, provinceId: null, districtId: null, wardCode: null, address: "" }));
  }, []);

  const value = useMemo(() => {
    const arr = [];
    if (selectedGhn.province) arr.push(selectedGhn.province);
    if (selectedGhn.district) arr.push(selectedGhn.district);
    if (selectedGhn.ward) arr.push(selectedGhn.ward);
    return arr;
  }, [selectedGhn.district, selectedGhn.province, selectedGhn.ward]);

  const getLabelForIndex = useCallback((opt, index) => {
    if (!opt || typeof opt !== "object") return "";
    if (index === 0) return opt?.ProvinceName ?? "";
    if (index === 1) return opt?.DistrictName ?? "";
    if (index === 2) return opt?.WardName ?? "";
    return "";
  }, []);

  const isOptionEqualToValue = useCallback((opt, val) => {
    if (!opt || !val) return false;
    if (opt?.WardCode != null || val?.WardCode != null)
      return String(opt?.WardCode ?? opt?.id) === String(val?.WardCode ?? val?.id);
    if (opt?.DistrictID != null || val?.DistrictID != null)
      return Number(opt?.DistrictID ?? opt?.id) === Number(val?.DistrictID ?? val?.id);
    return Number(opt?.ProvinceID ?? opt?.id) === Number(val?.ProvinceID ?? val?.id);
  }, []);

  /**
   * Handle the open event for the autocomplete
   * @returns {void}
   */
  const handleOpenAddress = useCallback(() => {
    if (step === "done") return;
    if (step === "province" && !provinces) {
      getProvinces({}, true)
        .unwrap()
        .catch((rejected) => console.error(rejected));
    }
  }, [getProvinces, provinces, step]);

  /**
   * Handle the change event for the autocomplete
   * @param {object} e - Event object contains the target of the change
   * @param {array} newValue - The new value of the autocomplete
   * @returns {void}
   */
  const handleChangeAddress = useCallback(
    (e, newValue) => {
      const newArr = Array.isArray(newValue) ? newValue : [];

      // Clear the selected values
      if (newArr.length === 0) {
        handleClear();
        return;
      }

      // Fetch districts
      if (newArr.length === 1) {
        const province = newArr[0];
        setSelectedGhn({ province, district: null, ward: null });
        const provinceId = province?.ProvinceID ?? province?.id ?? null;
        setCurrAddress((prev) => ({ ...prev, provinceId, districtId: null, wardCode: null }));
        if (provinceId != null) {
          getDistricts(provinceId, true)
            .unwrap()
            .catch((rejected) => console.error(rejected));
        }
        return;
      }

      // Fetch wards
      if (newArr.length === 2) {
        const province = newArr[0];
        const district = newArr[1];
        setSelectedGhn({ province, district, ward: null });
        const provinceId = province?.ProvinceID ?? province?.id ?? null;
        const districtId = district?.DistrictID ?? district?.id ?? null;
        setCurrAddress((prev) => ({ ...prev, provinceId, districtId, wardCode: null }));
        if (districtId != null) {
          getWards(districtId, true)
            .unwrap()
            .catch((rejected) => console.error(rejected));
        }
        return;
      }

      // Set the selected values
      if (newArr.length >= 3) {
        const province = newArr[0];
        const district = newArr[1];
        const ward = newArr[2];
        const address = `${province?.ProvinceName ?? ""}, ${district?.DistrictName ?? ""}, ${ward?.WardName ?? ""}`;
        setSelectedGhn({ province, district, ward });
        setCurrAddress((prev) => ({
          ...prev,
          provinceId: province?.id ?? null,
          districtId: district?.id ?? null,
          wardCode: ward?.id ?? null,
          address,
        }));
      }
    },
    [getDistricts, getWards, handleClear]
  );

  const isSelected = selectedValue != null && selectedValue == addressInfo?.id;
  const loadingAddress = loadingProvinces || loadingDistricts || loadingWards;
  const stepLabel = useMemo(() => {
    if (step === "done" || options.length === 0) return "";
    return `[${capitalize(t("address.selecting", { ns: "authenticated", item: t(`address.${step}`, { ns: "authenticated" }) }))}]`;
  }, [step, options]);

  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <LocationOnIcon />
        &nbsp;{t("address.recipient", { ns: "authenticated" })}
      </DialogTitle>
      <DialogContent>
        <form style={{ paddingTop: 10 }} onSubmit={handleSubmit}>
          <Instruction aria-live="assertive" style={{ marginTop: -10 }}>
            {errMsg}
          </Instruction>
          <Grid container size="grow" spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={err?.data?.errors?.name ?? t("address.name", { ns: "authenticated" })}
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
                    ? t("validation.constraints.pattern", {
                        field: t("phone", { ns: "authenticated" }),
                        ns: "validation",
                      })
                    : (err?.data?.errors?.phone ?? t("phone", { ns: "authenticated" }))
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
                format="(+84) #### ### ###"
                allowEmptyFormatting
                customInput={TextField}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={err?.data?.errors?.companyName ?? t("address.company", { ns: "authenticated" })}
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
                label={err?.data?.errors?.type ?? t("address.type.label", { ns: "authenticated" })}
                onChange={(e) => setCurrAddress({ ...currAddress, type: e.target.value })}
                select
                value={currAddress?.type || ""}
                error={err?.data?.errors?.type}
                fullWidth
                size="small"
              >
                <MenuItem value={null}>
                  <em>--{t("none")}--</em>
                </MenuItem>
                {addressTypeOptions.map((type, index) => (
                  <MenuItem key={index} value={type.value}>
                    {t(type.label, { ns: "authenticated" })}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <Autocomplete
                size="small"
                id="address-autocomplete"
                multiple
                clearOnEscape
                openOnFocus
                disableCloseOnSelect
                freeSolo
                inputValue={!wardList.length ? currAddress?.address : ""}
                loading={loadingAddress}
                options={options}
                value={value}
                onOpen={handleOpenAddress}
                onChange={handleChangeAddress}
                filterOptions={(opts) => opts}
                isOptionEqualToValue={isOptionEqualToValue}
                getOptionLabel={getLabelForStep}
                renderValue={(tagValue) =>
                  tagValue
                    .map((opt, idx) => getLabelForIndex(opt, idx))
                    .filter(Boolean)
                    .join(", ")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    id="address-autocomplete-input"
                    sx={{
                      "& .MuiInputBase-root": {
                        paddingLeft: "14px !important",
                      },
                    }}
                    placeholder={stepLabel}
                    label={t("address.input", { ns: "authenticated" })}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label={err?.data?.errors?.detail ?? t("address.detail", { ns: "authenticated" })}
                type="text"
                autoComplete="on"
                required
                onChange={(e) => setCurrAddress({ ...currAddress, detail: e.target.value })}
                value={currAddress?.detail}
                error={((errMsg != "" || addressInfo) && !currAddress?.detail) || err?.data?.errors?.detail}
                fullWidth
                size="small"
                multiline
                minRows={4}
                slotProps={{
                  inputComponent: TextareaAutosize,
                  inputProps: {
                    id: "address-detail-input",
                    minRows: 4,
                    style: { resize: "auto" },
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
                >
                  {t("delete")}&nbsp;
                  <Delete />
                </Button>
              )}
              <ToggleButtonGroup
                color="primary"
                value={setting}
                onChange={handleSettingChange}
                size="small"
                sx={{ ml: "auto" }}
                aria-label={t("address.settings")}
              >
                <ToggleButton
                  sx={{ px: 2, textTransform: "none", fontSize: 15 }}
                  value="default"
                  disabled={setting.includes("temp") || addressInfo?.isDefault || isSelected}
                >
                  {t("address.default.label", { ns: "authenticated" })}
                </ToggleButton>
                <ToggleButton
                  sx={{ px: 2, textTransform: "none", fontSize: 15 }}
                  value="temp"
                  disabled={setting.includes("default")}
                >
                  {t("address.temp", { ns: "authenticated" })}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" size="large" onClick={handleClose} startIcon={<CloseIcon />}>
          {t("cancel")}
        </Button>
        <Button variant="contained" color="primary" size="large" onClick={handleSubmit} startIcon={<Check />}>
          {t("apply")}
        </Button>
      </DialogActions>
    </>
  );
};

export default AddressForm;
