import styled from "@emotion/styled";
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import { useUpdateProfileMutation } from "../../features/users/usersApiSlice";
import { Instruction } from "@ring/ui/Components";
import { StyledDialogTitle } from "../custom/ProfileComponents";
import { PatternFormat } from "react-number-format";
import { PHONE_REGEX } from "@ring/shared/utils/regex";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash-es";
import { getGenderType } from "@ring/shared/enums/user";
import { Gender } from "@ring/shared/models/gender";
import useConfirm from "@ring/shared/useConfirm";
import useAuth from "../../hooks/useAuth";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import DialogContent from "@mui/material/DialogContent";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Check from "@mui/icons-material/Check";
import Clear from "@mui/icons-material/Clear";
import EditOutlined from "@mui/icons-material/EditOutlined";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import Person from "@mui/icons-material/Person";
import Replay from "@mui/icons-material/Replay";
import dayjs from "dayjs";
import ConfirmDialog from "@ring/ui/ConfirmDialog";

const DatePicker = lazy(() => import("@ring/ui/DatePicker"));
const ProfileImageComponent = lazy(() => import("./ProfileImageComponent"));
const LightboxImage = lazy(() => import("@ring/ui/LightboxImage"));

//#region styled
const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const RadioSkeleton = styled.div`
  display: flex;
  align-items: center;
`;

const TableContainer = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const InfoText = styled.span`
  font-weight: 450;
  white-space: nowrap;

  &.edit {
    white-space: nowrap;
    margin-left: 15px;
    text-decoration: underline;
    cursor: pointer;
    color: ${({ theme }) => theme.vars.palette.primary.main};
  }

  &.disabled {
    pointer-events: none;
    color: ${({ theme }) => theme.vars.palette.action.disabled};
  }
`;

const InfoRow = styled.tr`
  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 15px;
  }
`;

const ProfilePic = styled.th`
  text-align: center;
  padding-left: 10px;
`;

const ProfilePicContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoTitle = styled.td`
  width: 27%;
`;

const InfoStack = styled.td`
  padding-left: 10px;
`;

const InfoStackContainer = styled.div`
  position: relative;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 48px;
  }
`;

const BadgeButton = styled.span`
  display: flex;
  max-width: 100px;
  align-items: center;
  font-weight: 500;
  padding: 4px;
  border-radius: 50%;
  aspect-ratio: 1/1;
  font-size: 13px;
  justify-content: flex-end;
  color: ${({ theme }) => theme.vars.palette.common.black};
  background-color: ${({ theme }) => theme.vars.palette.grey[300]};
  border: 2px solid ${({ theme }) => theme.vars.palette.background.paper};
  cursor: pointer;

  &.disabled {
    pointer-events: none;
    color: ${({ theme }) => theme.vars.palette.grey[500]};
  }

  svg {
    font-size: 16px;
    margin-right: 0;
  }

  &.edit {
    @media (hover: hover) and (pointer: fine) {
      &:hover {
        color: ${({ theme }) => theme.vars.palette.primary.main};
      }
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme }) => theme.vars.palette.error.main};
      background-color: ${({ theme }) => theme.vars.palette.grey[200]};
      transition: 0.25s ease;
    }
  }
`;
//#endregion

const IMAGE_EXTENSIONS = ["jpeg", "jpg", "png", "gif", "svg"];
const IMAGE_SIZE_LIMIT = 1_048_576; // 1MB
const IMAGE_SIZE_LIMIT_MB = 1;

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}

const ProfileDetail = ({
  pending,
  setPending,
  profile,
  loading,
  isSuccess,
  mobileMode,
  tabletMode,
  verifyRefreshToken,
  handleClose,
}) => {
  // Initial value
  const { username } = useAuth();
  const { t, i18n } = useTranslation();
  const inputFile = useRef(null);
  const [errMsg, setErrMsg] = useState("");
  const [err, setErr] = useState([]);
  const [name, setName] = useState(profile?.name || "");
  const [dob, setDob] = useState(profile?.dob ? dayjs(profile?.dob) : dayjs("1970-01-01"));
  const [gender, setGender] = useState(profile?.gender || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [validPhone, setValidPhone] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [editDob, setEditDob] = useState(false);

  const [pic, setPic] = useState(profile?.image || null);
  const [imageSrc, setImageSrc] = useState(undefined);
  const [imageBlob, setImageBlob] = useState([]);
  const [openViewImage, setOpenViewImage] = useState(false);
  const { confirm, ConfirmationDialog } = useConfirm(ConfirmDialog);

  // Update profile hook
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

  // Set data
  useEffect(() => {
    if (!loading && isSuccess && profile) {
      setName(profile?.name) || "";
      setPhone(profile?.phone || "");
      setGender(profile?.gender || "");
      setDob(profile?.dob ? dayjs(profile?.dob) : dayjs("1970-01-01"));
      setPic(profile?.image || null);
    }
  }, [profile]);

  useEffect(() => {
    const result = PHONE_REGEX.test(phone);
    setValidPhone(result);
  }, [phone]);

  /**
   * Close profile image cropping dialog
   */
  const handleCloseDialog = () => {
    setImageSrc(null);
  };

  /**
   * Handle change profile image
   * @param {Event} e
   */
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const { name: fileName, size: fileSize } = file;
      const fileExtension = fileName.split(".").pop();

      setErrMsg("");
      setErr([]);

      if (!IMAGE_EXTENSIONS.includes(fileExtension)) {
        setErrMsg(t("validation.constraints.invalid", { field: "image", ns: "validation" }));
      } else if (fileSize > IMAGE_SIZE_LIMIT) {
        setErrMsg(t("validation.constraints.size.image", { max: IMAGE_SIZE_LIMIT_MB, ns: "validation" }));
      }

      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  /**
   * Handle crop image complete
   * @param {Blob} imageBlob
   */
  const handleCropComplete = (imageBlob) => {
    setPic(URL.createObjectURL(imageBlob));
    setImageBlob(imageBlob);
    handleCloseViewImage();
  };

  /**
   * Handle remove profile image
   */
  const handleRemovePic = async () => {
    const confirmation = await confirm(
      t("profile.media.remove"),
      t("profile.media.message"),
      t("cancel"),
      t("confirm")
    );
    if (confirmation) {
      setImageBlob(null);
      handleCloseViewImage();
      if (pic == profile?.image) {
        setPic(null);
      } else {
        setPic(profile?.image);
      }
      setErrMsg("");
      setErr([]);
    }
  };

  /**
   * Handle open profile image file input
   */
  const handleOpenFile = () => {
    inputFile.current.click();
  };

  /**
   * Handle change profile information
   * @param {Event} e
   */
  const handleChangeInfo = async (e) => {
    e.preventDefault();
    if (updating || pending) return;

    // Validation
    const valid = PHONE_REGEX.test(phone);
    if (!valid && phone) {
      return;
    }

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    // Set data
    const formData = new FormData();
    const json = JSON.stringify({
      name: name || null,
      phone: phone || null,
      gender: gender || null,
      dob: dob.format("YYYY-MM-DD"),
      removeImage: pic ? false : true,
    });
    const blob = new Blob([json], { type: "application/json" });

    formData.append("request", blob);
    if (imageBlob && imageBlob.size > 0) {
      const imageFile = new File([imageBlob], `${Date.now()}-${username}.png`, { type: "image/png" });
      formData.append("image", imageFile);
    }

    updateProfile(formData)
      .unwrap()
      .then((data) => {
        setErrMsg("");
        setErr([]);
        enqueueSnackbar(t("message.success", { action: t("profile.update") }), { variant: "success" });
        setPending(false);
        verifyRefreshToken(); //Refresh
      })
      .catch((err) => {
        console.error(err);
        setErr(err);
        if (!err?.status) {
          setErrMsg(t("error.server.response"));
        } else {
          setErrMsg(err?.data?.message);
        }
        enqueueSnackbar(t("message.error", { action: t("profile.update") }), { variant: "error" });
        setPending(false);
      });
  };

  /**
   * Handle click avatar
   */
  const handleClickAvatar = () => {
    if (pic != null) {
      setOpenViewImage(true);
    } else {
      handleOpenFile();
    }
  };

  /**
   * Handle click badge
   */
  const handleClickBadge = () => {
    if (pic) {
      handleRemovePic();
    } else {
      if (profile?.image) {
        setPic(profile?.image);
      } else {
        handleOpenFile();
      }
    }
  };

  /**
   * Handle close view profile image
   */
  const handleCloseViewImage = () => {
    setOpenViewImage(false);
  };

  const profileImage = loading ? (
    <Skeleton variant="circular" sx={{ my: { xs: 2, md: 0 }, width: 120, height: 120 }} />
  ) : (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      badgeContent={
        <BadgeButton
          aria-label={
            pic ? t("profile.media.remove") : !profile?.image ? t("profile.media.add") : t("profile.media.reset")
          }
          className={!pic ? "edit" : ""}
          onClick={handleClickBadge}
        >
          {pic ? <Clear /> : !profile?.image ? <EditOutlined /> : <Replay />}
        </BadgeButton>
      }
    >
      <Avatar
        alt={name ?? t("profile.media.edit")}
        src={pic}
        aria-label={t("profile.media.edit")}
        sx={{
          my: { xs: 2, md: 0 },
          width: 120,
          height: 120,
          cursor: "pointer",
        }}
        onClick={handleClickAvatar}
      />
    </Badge>
  );

  /**
   * Render profile detail
   */
  return (
    <>
      <StyledDialogTitle>
        <a onClick={handleClose}>
          <KeyboardArrowLeft />
        </a>
        <Person />
        &nbsp;{t("profile.title")}
      </StyledDialogTitle>
      <DialogContent sx={{ p: { xs: 1, sm: 2, md: 0 }, mt: { xs: 1, md: 0 }, height: { xs: "100dvh", md: "auto" } }}>
        <Instruction display={errMsg ? "block" : "none"} aria-live="assertive">
          {errMsg}
        </Instruction>
        <TableContainer>
          <tbody>
            {tabletMode && (
              <InfoRow>
                <ProfilePic colSpan={3}>
                  <ProfilePicContainer>{profileImage}</ProfilePicContainer>
                </ProfilePic>
              </InfoRow>
            )}
            <InfoRow>
              <InfoTitle>
                <InfoText>{t("username")} </InfoText>
              </InfoTitle>
              <InfoStack>
                <InfoStackContainer>
                  {loading ? (
                    <Skeleton variant="text" sx={{ fontSize: "16px" }} width={120} />
                  ) : (
                    <InfoText>{username}</InfoText>
                  )}
                </InfoStackContainer>
              </InfoStack>
              {!tabletMode && (
                <ProfilePic rowSpan={3}>
                  <ProfilePicContainer>{profileImage}</ProfilePicContainer>
                </ProfilePic>
              )}
            </InfoRow>
            <InfoRow>
              <InfoTitle>
                <InfoText>{t("email.label")} </InfoText>
              </InfoTitle>
              <InfoStack>
                <InfoStackContainer>
                  {loading ? (
                    <Skeleton variant="text" sx={{ fontSize: "16px" }} width={110} />
                  ) : (
                    <InfoText>{profile?.email.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, "$1***@$2")}</InfoText>
                  )}
                </InfoStackContainer>
              </InfoStack>
            </InfoRow>
            <InfoRow>
              <InfoTitle>
                <InfoText>{t("fullname.label")} </InfoText>
              </InfoTitle>
              <InfoStack>
                <InfoStackContainer>
                  {loading ? (
                    <Skeleton variant="rectangular" height={40} width="100%" />
                  ) : (
                    <TextField
                      required
                      placeholder={t("fullname.placeholder")}
                      id="name"
                      disabled={loading}
                      onChange={(e) => setName(e.target.value)}
                      value={name ?? ""}
                      error={err?.data?.errors?.name}
                      label={err?.data?.errors?.name}
                      size="small"
                      fullWidth
                    />
                  )}
                </InfoStackContainer>
              </InfoStack>
            </InfoRow>
            <InfoRow>
              <InfoTitle>
                <InfoText>{t("phone")} </InfoText>
              </InfoTitle>
              <InfoStack colSpan={2}>
                <InfoStackContainer>
                  {editPhone ? (
                    <PatternFormat
                      required
                      id="phone"
                      onValueChange={(values) => setPhone(values.value)}
                      value={phone}
                      error={(phone && !validPhone) || err?.data?.errors?.phone}
                      label={
                        phone && !validPhone
                          ? capitalize("validation.constraints.pattern", { ns: "validation", field: t("phone") })
                          : err?.data?.errors?.phone
                      }
                      size="small"
                      fullWidth
                      format="(+84) ### ### ###"
                      allowEmptyFormatting
                      customInput={TextField}
                    />
                  ) : (
                    <>
                      {loading ? (
                        <Skeleton variant="text" sx={{ fontSize: "16px" }} width="25%" />
                      ) : (
                        <InfoText>{phone ? phone.replace(/\d(?=\d{2})/g, "*") : t("yet")}</InfoText>
                      )}
                      <InfoText className={`edit ${loading ? "disabled" : ""}`} onClick={() => setEditPhone(true)}>
                        {t("edit")}
                      </InfoText>
                    </>
                  )}
                </InfoStackContainer>
              </InfoStack>
            </InfoRow>
            <InfoRow>
              <InfoTitle>
                <InfoText>{t("dob")} </InfoText>
              </InfoTitle>
              <InfoStack colSpan={2}>
                <InfoStackContainer>
                  {editDob ? (
                    <Suspense
                      fallback={
                        <>
                          {loading ? (
                            <Skeleton variant="text" sx={{ fontSize: "16px" }} width="30%" />
                          ) : (
                            <InfoText>{dob.format("DD/MM/YYYY")}</InfoText>
                          )}
                          <InfoText className={`edit ${loading ? "disabled" : ""}`} onClick={() => setEditDob(true)}>
                            {t("edit")}
                          </InfoText>
                        </>
                      }
                    >
                      <DatePicker
                        locale={i18n.language}
                        required
                        value={dob}
                        className="custom-date-picker"
                        onChange={(newValue) => setDob(newValue)}
                        size="small"
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            error: err?.data?.errors?.dob,
                            label: err?.data?.errors?.dob,
                          },
                        }}
                      />
                    </Suspense>
                  ) : (
                    <>
                      {loading ? (
                        <Skeleton variant="text" sx={{ fontSize: "16px" }} width="30%" />
                      ) : (
                        <InfoText>{dob.format("DD/MM/YYYY")}</InfoText>
                      )}
                      <InfoText className={`edit ${loading ? "disabled" : ""}`} onClick={() => setEditDob(true)}>
                        {t("edit")}
                      </InfoText>
                    </>
                  )}
                </InfoStackContainer>
              </InfoStack>
            </InfoRow>
            <InfoRow>
              <InfoTitle>
                <InfoText>{t("gender.label")} </InfoText>
              </InfoTitle>
              <InfoStack colSpan={2}>
                <InfoStackContainer>
                  {tabletMode ? (
                    loading ? (
                      <Skeleton variant="rectangular" height={40} width="100%" />
                    ) : (
                      <TextField
                        required
                        select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        size="small"
                        fullWidth
                      >
                        <MenuItem value={""}>{t("none")}</MenuItem>
                        {Object.values(Gender).map((gender, index) => {
                          const genderMeta = getGenderType(gender);
                          return (
                            <MenuItem key={`menu-${genderMeta?.value}-${index}`} value={genderMeta?.value}>
                              {t(genderMeta?.label)}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    )
                  ) : loading ? (
                    <RadioSkeleton>
                      <Skeleton variant="text" width={75} sx={{ fontSize: 14, mr: 2 }} />
                      <Skeleton variant="text" width={75} sx={{ fontSize: 14, mr: 2 }} />
                      <Skeleton variant="text" width={75} sx={{ fontSize: 14 }} />
                    </RadioSkeleton>
                  ) : (
                    <RadioGroup spacing={1} row value={gender} onChange={(e) => setGender(e.target.value)}>
                      <FormControlLabel value={""} control={<Radio />} label={t("none")} />
                      {Object.values(Gender).map((gender, index) => {
                        const genderMeta = getGenderType(gender);
                        return (
                          <FormControlLabel
                            key={`radio-${genderMeta?.value}-${index}`}
                            value={genderMeta?.value}
                            control={<Radio />}
                            label={t(genderMeta?.label)}
                          />
                        );
                      })}
                    </RadioGroup>
                  )}
                </InfoStackContainer>
              </InfoStack>
            </InfoRow>
          </tbody>
        </TableContainer>
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          onClick={handleChangeInfo}
          sx={{ mt: 2, mb: 4 }}
          startIcon={<Check />}
        >
          {t("profile.save")}
        </Button>
      </DialogContent>
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        ref={inputFile}
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      {openViewImage && (
        <Suspense fallBack={null}>
          <LightboxImage image={pic} open={openViewImage} handleClose={handleCloseViewImage}>
            <ButtonsContainer>
              <Button sx={{ mr: 1 }} variant="outlined" onClick={handleOpenFile}>
                {t("edit")}
              </Button>
              <Button variant="outlined" color="error" onClick={handleRemovePic}>
                {t("remove")}
              </Button>
            </ButtonsContainer>
          </LightboxImage>
        </Suspense>
      )}
      <ConfirmationDialog />
      {imageSrc != undefined && (
        <Suspense fallBack={null}>
          <ProfileImageComponent
            image={imageSrc}
            mobileMode={mobileMode}
            handleCropComplete={handleCropComplete}
            handleClose={handleCloseDialog}
          />
        </Suspense>
      )}
    </>
  );
};

export default ProfileDetail;
