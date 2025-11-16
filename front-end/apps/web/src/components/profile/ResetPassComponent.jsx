import { useEffect, useState, lazy, Suspense } from "react";
import { useChangePasswordMutation } from "../../features/users/usersApiSlice";
import { Link } from "react-router";
import { StyledDialogTitle } from "../custom/ProfileComponents";
import { Instruction } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import Check from "@mui/icons-material/Check";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import Password from "@mui/icons-material/Password";

import PasswordInput from "@ring/ui/PasswordInput";
import PasswordEvaluate from "../custom/PasswordEvaluate";

const PendingModal = lazy(() => import("@ring/ui/PendingModal"));

const ResetPassComponent = ({ pending, setPending, verifyRefreshToken, refreshing }) => {
  const { t } = useTranslation();
  const [err, setErr] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [pass, setPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPassRe, setNewPassRe] = useState("");
  const [validNewPass, setValidNewPass] = useState(true);
  const [validNewPassRe, setValidNewPassRe] = useState(true);

  // Change pass hook
  const [changePass, { isLoading: changing }] = useChangePasswordMutation();

  // Submit change pass mutation
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pending || changing || refreshing) return;

    if (!validNewPass) {
      setErrMsg("Sai định dạng thông tin!");
      return;
    }

    if (!newPass || !newPassRe) {
      setErrMsg("Không được bỏ trống mật khẩu mới!");
      setValidNewPass(false);
      setValidNewPassRe(false);
      return;
    }

    if (newPass !== newPassRe) {
      setErrMsg("Không trùng mật khẩu!");
      setValidNewPass(false);
      setValidNewPassRe(false);
      return;
    }

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    changePass({
      pass,
      newPass,
      newPassRe,
    })
      .unwrap()
      .then((data) => {
        setErr([]);
        setErrMsg("");
        setPass("");
        setNewPass("");
        setNewPassRe("");

        // Queue snack
        enqueueSnackbar("Đổi mật khẩu thành công!", { variant: "success" });
        setPending(false);
      })
      .catch((err) => {
        console.error(err);
        setErr(err);
        if (!err?.status) {
          setErrMsg("Server không phản hồi");
        } else if (err?.status === 409) {
          setErrMsg(err?.data?.message);
        } else if (err?.status === 400) {
          setErrMsg("Sai định dạng thông tin!");
        } else {
          setErrMsg("Cập nhật hồ sơ thất bại");
        }
        setPending(false);
      });
  };

  // Check valid token
  useEffect(() => {
    verifyRefreshToken();
  }, []);

  // Validation
  useEffect(() => {
    const match = newPass === newPassRe;
    setValidNewPassRe(match);
  }, [newPassRe]);

  useEffect(() => {
    setErrMsg("");
  }, [newPass, newPassRe, pass]);

  const validReset = [pass, newPass, newPassRe, validNewPass, validNewPassRe].every(Boolean);

  return (
    <div>
      {refreshing && (
        <Suspense fallBack={null}>
          <PendingModal open={refreshing} message="Đang xác thực đăng nhập ..." />
        </Suspense>
      )}
      <StyledDialogTitle>
        <Link to={-1}>
          <KeyboardArrowLeft />
        </Link>
        <Password />
        &nbsp;{t("password.change.title")}
      </StyledDialogTitle>
      <DialogContent sx={{ p: { xs: 1, sm: 2, md: 0 }, mt: { xs: 1, md: 0 }, height: { xs: "100dvh", md: "auto" } }}>
        <Instruction aria-live="assertive" style={{ marginTop: -10 }}>
          {errMsg}
        </Instruction>
        <form onSubmit={handleChangePassword}>
          <Stack mt={2} spacing={1.5} direction="column" minHeight={"70dvh"} maxWidth={{ xs: "100%", md: 380 }}>
            <PasswordInput
              label={err?.data?.errors?.password ?? t("password.change.old")}
              onChange={(e) => setPass(e.target.value)}
              value={pass}
              error={err?.data?.errors?.password}
              size="small"
            />
            <PasswordInput
              label={err?.data?.errors?.newPass ?? t("password.change.new")}
              onChange={(e) => setNewPass(e.target.value)}
              value={newPass}
              aria-invalid={validNewPass ? "false" : "true"}
              error={(newPass && !validNewPass) || err?.data?.errors?.newPass}
              size="small"
            />
            <PasswordInput
              label={
                newPassRe && !validNewPassRe
                  ? t("validation.constraints.password.match", { ns: "validation" })
                  : (err?.data?.errors?.newPassRe ?? t("password.change.confirm"))
              }
              onChange={(e) => setNewPassRe(e.target.value)}
              value={newPassRe}
              aria-invalid={validNewPassRe ? "false" : "true"}
              error={(newPassRe && !validNewPassRe) || err?.data?.errors?.newPassRe}
              size="small"
            />
            <Box sx={{ whiteSpace: { xs: "normal", sm: "nowrap" }, height: 110 }}>
              <PasswordEvaluate
                {...{
                  password: newPass,
                  onValid: (value) => setValidNewPass(value),
                }}
              />
            </Box>
            <Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleChangePassword}
                disabled={!validReset || pending || changing}
                startIcon={<Check />}
              >
                {t("confirm")}
              </Button>
            </Box>
          </Stack>
        </form>
      </DialogContent>
    </div>
  );
};

export default ResetPassComponent;
