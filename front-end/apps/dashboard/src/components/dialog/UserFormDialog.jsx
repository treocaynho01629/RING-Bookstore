import { useCallback, useEffect, useState } from "react";
import { Button, Checkbox, ListItemText, useMediaQuery } from "@mui/material";
import { TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Grid } from "@mui/material";
import { Check, Close as CloseIcon, Person as PersonIcon } from "@mui/icons-material";
import { Instruction, DatePicker, PasswordInput } from "@ring/ui";
import { PatternFormat } from "react-number-format";
import { useCreateUserMutation, useUpdateUserMutation } from "../../features/users/usersApiSlice";
import { genderTypeOptions, userRoleOptions } from "@ring/shared/enums/user";
import { EMAIL_REGEX, PHONE_REGEX } from "@ring/shared/utils/regex";
import dayjs from "dayjs";
import SingleImageCropUpload from "../custom/SingleImageCropUpload";
import { useTranslations } from "next-intl";
import usePendingModal from "@/hooks/usePendingModal";

const UserFormDialog = ({ open, handleClose, user }) => {
  const t = useTranslations();
  const { open: pending, showPending, hidePending } = usePendingModal();

  //#region construct
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [file, setFile] = useState([]);
  const [pic, setPic] = useState(user?.image || null);
  const [username, setUserName] = useState(user?.username || "");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [dob, setDob] = useState(user?.dob ? dayjs(user?.dob) : dayjs("1970-01-01"));
  const [roles, setRoles] = useState(user?.roles ?? [userRoleOptions[0]?.value]);
  const [gender, setGender] = useState(user?.gender ?? genderTypeOptions[0]?.value);
  const [removeImage, setRemoveImage] = useState(false);
  const [err, setErr] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [validPhone, setValidPhone] = useState(false);
  const [validEmail, setValidEmail] = useState(false);

  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setPic(user?.image || null);
      setUserName(user?.username);
      setEmail(user?.email);
      setRoles(user?.roles ?? [userRoleOptions[0]?.value]);
      setName(user?.name || "");
      setPhone(user?.phone || "");
      setGender(user?.gender ?? genderTypeOptions[0]?.value);
      setDob(dayjs(user?.dob));
      setRemoveImage(false);
      setErr([]);
      setErrMsg("");
    } else {
      clearInput();
    }
  }, [user]);

  useEffect(() => {
    const result = PHONE_REGEX.test(phone);
    setValidPhone(result);
  }, [phone]);

  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  const handleChangeRoles = useCallback((e) => {
    const value = e.target.value;
    setRoles(typeof value === "string" ? value.split(",") : value);
  }, []);

  const clearInput = () => {
    setPic("");
    setUserName("");
    setPass("");
    setEmail("");
    setName("");
    setPhone("");
    setRoles([userRoleOptions[0]?.value]);
    setGender(genderTypeOptions[0]?.value);
    setRemoveImage(false);
    setDob(dayjs("2001-01-01"));
    setErr([]);
    setErrMsg("");
  };

  const handleCloseDialog = () => {
    setFile([]);
    handleClose();
  };

  const handleClearImage = () => {
    setFile([]);
    setRemoveImage(true);
    setPic(null);
  };

  const handleImageSelected = () => {
    setRemoveImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (creating || updating || pending) return;

    showPending();
    const { enqueueSnackbar } = await import("notistack");

    //Set data
    const formData = new FormData();
    const json = JSON.stringify({
      username,
      email,
      roles,
      pass: user && !pass ? undefined : pass,
      name: name || null,
      phone: phone || null,
      gender: gender || null,
      dob: dob.format("YYYY-MM-DD"),
      removeImage: user && removeImage,
    });
    const blob = new Blob([json], { type: "application/json" });

    formData.append("request", blob);
    if (file?.length) formData.append("image", file[0]);
    else if (user && removeImage && !file?.length) {
      // Send empty file or a flag - backend may expect removeImage in request only
    }

    if (user) {
      //Update
      updateUser({ id: user?.id, updatedUser: formData })
        .unwrap()
        .then((data) => {
          setErrMsg("");
          setErr([]);
          enqueueSnackbar("Chỉnh sửa thành viên thành công!", {
            variant: "success",
          });
          hidePending();
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
            setErrMsg("Chỉnh sửa thành vien thất bại!");
          }
          enqueueSnackbar("Chỉnh sửa thành viên thất bại!", {
            variant: "error",
          });
          hidePending();
        });
    } else {
      //Create
      createUser(formData)
        .unwrap()
        .then((data) => {
          clearInput();
          setErrMsg("");
          setErr([]);
          enqueueSnackbar("Thêm thành viên thành công!", {
            variant: "success",
          });
          hidePending();
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
            setErrMsg("Thêm thành viên thất bại!");
          }
          enqueueSnackbar("Thêm thành viên thất bại!", { variant: "error" });
          hidePending();
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
        <PersonIcon />
        &nbsp;{user ? t("user.edit") : t("user.add")}
      </DialogTitle>
      <DialogContent sx={{ pt: 0, px: { xs: 1, sm: 3 } }}>
        <form onSubmit={handleSubmit}>
          <Instruction display={errMsg ? "block" : "none"}>{errMsg}</Instruction>
          <Grid container size="grow" spacing={1}>
            <Grid size={12} display="flex" justifyContent="center" py={2}>
              <SingleImageCropUpload
                image={pic}
                file={file}
                setFile={setFile}
                onImageSelected={handleImageSelected}
                onImageCleared={handleClearImage}
                helperText="Max 2MB"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="username"
                label={t("user.username")}
                fullWidth
                variant="outlined"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                error={err?.data?.errors?.username}
                helperText={err?.data?.errors?.username}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                id="email"
                label={t("user.email")}
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={validEmail ? "false" : "true"}
                error={(email && !validEmail) || err?.data?.errors?.email != null}
                helperText={email && !validEmail ? t("validation.email") : err?.data?.errors?.email}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <PasswordInput
                required={user != null}
                id="pass"
                label={t("user.password")}
                fullWidth
                variant="outlined"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                error={err?.data?.errors?.pass}
                helperText={err?.data?.errors?.pass}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="name"
                label={t("user.name")}
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={err?.data?.errors?.name}
                helperText={err?.data?.errors?.name}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <PatternFormat
                id="phone"
                label={t("user.phone")}
                onValueChange={(values) => setPhone(values.value)}
                value={phone}
                error={(phone && !validPhone) || err?.data?.errors?.phone}
                helperText={phone && !validPhone ? t("validation.phone") : err?.data?.errors?.phone}
                fullWidth
                format="(+84) ### ### ###"
                allowEmptyFormatting
                customInput={TextField}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t("user.gender")}
                select
                fullWidth
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                {genderTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {t(option.label)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label={t("user.dob")}
                value={dob}
                className="custom-date-picker"
                onChange={(newValue) => setDob(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: err?.data?.errors?.dob,
                    helperText: err?.data?.errors?.dob,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t("user.roles")}
                id="roles"
                select
                required
                fullWidth
                slotProps={{
                  select: {
                    multiple: true,
                    value: roles,
                    onChange: (e) => handleChangeRoles(e),
                    renderValue: (selected) =>
                      (selected ?? [])
                        .map((value) => userRoleOptions.find((r) => r.value === value)?.label ?? value)
                        .map((label) => t(label))
                        .join(", "),
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
                {userRoleOptions.map((role, index) => (
                  <MenuItem key={`role-${role.value}-${index}`} value={role.value}>
                    <Checkbox sx={{ py: 0.5, pr: 1, pl: 0 }} disableRipple checked={roles?.includes(role.value)} />
                    <ListItemText primary={t(role.label)} />
                  </MenuItem>
                ))}
              </TextField>
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
    </Dialog>
  );
};

export default UserFormDialog;
