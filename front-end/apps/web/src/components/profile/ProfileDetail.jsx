import styled from "@emotion/styled";
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import { useUpdateProfileMutation } from "../../features/users/usersApiSlice";
import { Instruction, MobileExtendButton } from "@ring/ui/Components";
import { Link } from "react-router";
import { StyledDialogTitle } from "../custom/ProfileComponents";
import { PatternFormat } from "react-number-format";
import { PHONE_REGEX } from "@ring/shared/utils/regex";
import { getGenderType } from "@ring/shared/enums/user";
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
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Person from "@mui/icons-material/Person";

import dayjs from "dayjs";

const DatePicker = lazy(() => import("@ring/ui/DatePicker"));

//#region styled
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
    &:hover {
      color: ${({ theme }) => theme.vars.palette.primary.main};
    }
  }

  &:hover {
    color: ${({ theme }) => theme.vars.palette.error.main};
    background-color: ${({ theme }) => theme.vars.palette.grey[200]};
    transition: 0.25s ease;
  }
`;
//#endregion

const GenderType = getGenderType();
const allowedExtensions = ["jpeg", "jpg", "png", "gif", "svg"],
  sizeLimit = 2_097_152; //2MB

const ProfileDetail = ({
  pending,
  setPending,
  profile,
  loading,
  isSuccess,
  tabletMode,
  verifyRefreshToken,
}) => {
  //Initial value
  const { username } = useAuth();
  const inputFile = useRef(null);
  const [errMsg, setErrMsg] = useState("");
  const [err, setErr] = useState([]);
  const [name, setName] = useState(profile?.name || "");
  const [dob, setDob] = useState(
    profile?.dob ? dayjs(profile?.dob) : dayjs("1970-01-01")
  );
  const [gender, setGender] = useState(profile?.gender || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [validPhone, setValidPhone] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [editDob, setEditDob] = useState(false);
  const [pic, setPic] = useState(profile?.image || null);
  const [file, setFile] = useState(null);
  const [ConfirmationDialog, confirm] = useConfirm(
    "Gỡ ảnh đại diện?",
    "Gỡ bỏ anh đại diện hiện tại?"
  );

  //Update profile hook
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

  //Set data
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

  const handleChangePic = (e) => {
    const { name: fileName, size: fileSize } = e.target.files[0];
    const fileExtension = fileName.split(".").pop();
    setErrMsg("");
    setErr([]);

    if (!allowedExtensions.includes(fileExtension)) {
      setErrMsg(`${fileName} sai định dạng ảnh!`);
    } else if (fileSize > sizeLimit) {
      setErrMsg(`${fileName} kích thước quá lớn!`);
    } else {
      setPic(URL.createObjectURL(e.target.files[0]));
      setFile(e.target.files[0]);
    }
  };

  const handleRemovePic = async () => {
    const confirmation = await confirm();
    if (confirmation) {
      setFile(null);
      if (pic == profile?.image) {
        setPic(null);
      } else {
        setPic(profile?.image);
      }
      setErrMsg("");
      setErr([]);
    } else {
      console.log("Cancel");
    }
  };

  const handleClickBadge = () => {
    if (!profile?.image && !pic) {
      handleOpenFile();
    } else {
      handleRemovePic();
    }
  };

  const handleOpenFile = () => {
    inputFile.current.click();
  };

  const handleChangeInfo = async (e) => {
    e.preventDefault();
    if (updating || pending) return;

    //Validation
    const valid = PHONE_REGEX.test(phone);
    if (!valid && phone) {
      return;
    }

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    //Set data
    const formData = new FormData();
    const json = JSON.stringify({
      name: name || null,
      phone: phone || null,
      gender: gender || null,
      dob: dob.format("YYYY-MM-DD"),
      image: file ? null : pic,
    });
    const blob = new Blob([json], { type: "application/json" });

    formData.append("request", blob);
    if (file) formData.append("image", file);

    updateProfile(formData)
      .unwrap()
      .then((data) => {
        setErrMsg("");
        setErr([]);
        enqueueSnackbar("Cập nhật hồ sơ thành công!", { variant: "success" });
        setPending(false);
        verifyRefreshToken(); //Refresh
      })
      .catch((err) => {
        console.error(err);
        setErr(err);
        if (!err?.status) {
          setErrMsg("Server không phản hồi");
        } else if (err?.status === 400) {
          setErrMsg("Sai định dạng thông tin!");
        } else if (err?.status === 403) {
          setErrMsg("Bạn không có quyền làm điều này!");
        } else {
          setErrMsg("Cập nhật hồ sơ thất bại");
        }
        enqueueSnackbar("Cập nhật hồ sơ thất bại!", { variant: "error" });
        setPending(false);
      });
  };

  return (
    <>
      <StyledDialogTitle>
        <Link to={-1}>
          <KeyboardArrowLeft />
        </Link>
        <Person />
        &nbsp;Hồ sơ của bạn
      </StyledDialogTitle>
      <DialogContent sx={{ p: { xs: 1, sm: 2, md: 0 }, mt: { xs: 1, md: 0 } }}>
        <Instruction display={errMsg ? "block" : "none"} aria-live="assertive">
          {errMsg}
        </Instruction>
        <TableContainer>
          <tbody>
            {tabletMode && (
              <InfoRow>
                <ProfilePic colSpan={3}>
                  <ProfilePicContainer>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <BadgeButton
                          className={!profile?.image && !pic ? "edit" : ""}
                          onClick={handleClickBadge}
                        >
                          {!profile?.image && !pic ? (
                            <EditOutlined />
                          ) : (
                            <Clear />
                          )}
                        </BadgeButton>
                      }
                    >
                      <Avatar
                        alt={name ?? "Profile pic"}
                        src={pic}
                        sx={{
                          my: 2,
                          width: 120,
                          height: 120,
                          cursor: "pointer",
                        }}
                        onClick={handleOpenFile}
                      />
                    </Badge>
                  </ProfilePicContainer>
                </ProfilePic>
              </InfoRow>
            )}
            <InfoRow>
              <InfoTitle>
                <InfoText>Tên đăng nhập </InfoText>
              </InfoTitle>
              <InfoStack>
                <InfoStackContainer>
                  {loading ? (
                    <Skeleton
                      variant="text"
                      sx={{ fontSize: "16px" }}
                      width={120}
                    />
                  ) : (
                    <InfoText>{username}</InfoText>
                  )}
                </InfoStackContainer>
              </InfoStack>
              {!tabletMode && (
                <ProfilePic rowSpan={3}>
                  <ProfilePicContainer>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                      badgeContent={
                        <BadgeButton
                          className={`${!profile?.image && !pic ? "edit" : ""} ${loading ? "disabled" : ""}`}
                          onClick={handleClickBadge}
                        >
                          {!profile?.image && !pic ? (
                            <EditOutlined />
                          ) : (
                            <Clear />
                          )}
                        </BadgeButton>
                      }
                    >
                      {loading ? (
                        <Skeleton variant="circular" width={120} height={120} />
                      ) : (
                        <Avatar
                          alt={name ?? "Profile pic"}
                          src={pic}
                          sx={{ width: 120, height: 120, cursor: "pointer" }}
                          onClick={handleOpenFile}
                        />
                      )}
                    </Badge>
                  </ProfilePicContainer>
                </ProfilePic>
              )}
            </InfoRow>
            <InfoRow>
              <InfoTitle>
                <InfoText>Email </InfoText>
              </InfoTitle>
              <InfoStack>
                <InfoStackContainer>
                  {loading ? (
                    <Skeleton
                      variant="text"
                      sx={{ fontSize: "16px" }}
                      width={110}
                    />
                  ) : (
                    <InfoText>
                      {profile?.email.replace(
                        /(\w{3})[\w.-]+@([\w.]+\w)/,
                        "$1***@$2"
                      )}
                    </InfoText>
                  )}
                </InfoStackContainer>
              </InfoStack>
            </InfoRow>
            <InfoRow>
              <InfoTitle>
                <InfoText>Họ & Tên </InfoText>
              </InfoTitle>
              <InfoStack>
                <InfoStackContainer>
                  {loading ? (
                    <Skeleton variant="rectangular" height={40} width="100%" />
                  ) : (
                    <TextField
                      required
                      placeholder="Nhập Họ và Tên"
                      id="name"
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
                <InfoText>Số điện thoại </InfoText>
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
                          ? "Sai định dạng số điện thoại!"
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
                        <Skeleton
                          variant="text"
                          sx={{ fontSize: "16px" }}
                          width="25%"
                        />
                      ) : (
                        <InfoText>
                          {phone
                            ? phone.replace(/\d(?=\d{2})/g, "*")
                            : "Chưa có"}
                        </InfoText>
                      )}
                      <InfoText
                        className={`edit ${loading ? "disabled" : ""}`}
                        onClick={() => setEditPhone(true)}
                      >
                        Thay đổi
                      </InfoText>
                    </>
                  )}
                </InfoStackContainer>
              </InfoStack>
            </InfoRow>
            <InfoRow>
              <InfoTitle>
                <InfoText>Ngày sinh </InfoText>
              </InfoTitle>
              <InfoStack colSpan={2}>
                <InfoStackContainer>
                  {editDob ? (
                    <Suspense
                      fallback={
                        <>
                          {loading ? (
                            <Skeleton
                              variant="text"
                              sx={{ fontSize: "16px" }}
                              width="30%"
                            />
                          ) : (
                            <InfoText>{dob.format("DD/MM/YYYY")}</InfoText>
                          )}
                          <InfoText
                            className={`edit ${loading ? "disabled" : ""}`}
                            onClick={() => setEditDob(true)}
                          >
                            Thay đổi
                          </InfoText>
                        </>
                      }
                    >
                      <DatePicker
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
                        <Skeleton
                          variant="text"
                          sx={{ fontSize: "16px" }}
                          width="30%"
                        />
                      ) : (
                        <InfoText>{dob.format("DD/MM/YYYY")}</InfoText>
                      )}
                      <InfoText
                        className={`edit ${loading ? "disabled" : ""}`}
                        onClick={() => setEditDob(true)}
                      >
                        Thay đổi
                      </InfoText>
                    </>
                  )}
                </InfoStackContainer>
              </InfoStack>
            </InfoRow>
            <InfoRow>
              <InfoTitle>
                <InfoText>Giới tính </InfoText>
              </InfoTitle>
              <InfoStack colSpan={2}>
                <InfoStackContainer>
                  {tabletMode ? (
                    loading ? (
                      <Skeleton
                        variant="rectangular"
                        height={40}
                        width="100%"
                      />
                    ) : (
                      <TextField
                        required
                        select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        size="small"
                        fullWidth
                      >
                        {Object.values(GenderType).map((gender, index) => (
                          <MenuItem
                            key={`menu-${gender?.value}-${index}`}
                            value={gender?.value}
                          >
                            {gender?.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )
                  ) : loading ? (
                    <>
                      <Skeleton
                        variant="text"
                        width={75}
                        sx={{ fontSize: 14, mr: 2 }}
                      />
                      <Skeleton
                        variant="text"
                        width={75}
                        sx={{ fontSize: 14, mr: 2 }}
                      />
                      <Skeleton
                        variant="text"
                        width={75}
                        sx={{ fontSize: 14 }}
                      />
                    </>
                  ) : (
                    <RadioGroup
                      spacing={1}
                      row
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      {Object.values(GenderType).map((gender, index) => (
                        <FormControlLabel
                          key={`radio-${gender?.value}-${index}`}
                          value={gender?.value}
                          control={<Radio />}
                          label={gender?.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </InfoStackContainer>
              </InfoStack>
            </InfoRow>
            {tabletMode && (
              <>
                <InfoRow>
                  <InfoTitle>
                    <InfoText>Sổ địa chỉ </InfoText>
                  </InfoTitle>
                  <InfoStack>
                    <Link to={"/profile/detail/address"}>
                      <InfoStackContainer>
                        <MobileExtendButton>
                          <KeyboardArrowRight fontSize="small" />
                        </MobileExtendButton>
                      </InfoStackContainer>
                    </Link>
                  </InfoStack>
                </InfoRow>
                <InfoRow>
                  <InfoTitle>
                    <InfoText>Thiết lập mật khẩu </InfoText>
                  </InfoTitle>
                  <InfoStack>
                    <Link to={"/profile/detail/password"}>
                      <InfoStackContainer>
                        <MobileExtendButton>
                          <KeyboardArrowRight fontSize="small" />
                        </MobileExtendButton>
                      </InfoStackContainer>
                    </Link>
                  </InfoStack>
                </InfoRow>
              </>
            )}
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
          Lưu thông tin
        </Button>
      </DialogContent>
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        ref={inputFile}
        style={{ display: "none" }}
        onChange={handleChangePic}
      />
      <ConfirmationDialog />
    </>
  );
};

export default ProfileDetail;
