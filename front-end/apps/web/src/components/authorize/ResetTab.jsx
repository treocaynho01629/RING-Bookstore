import { useEffect, useRef, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router";
import { Stack } from "@mui/material";
import { useResetMutation } from "../../features/auth/authApiSlice";
import { AuthTitle, ConfirmButton } from "@ring/ui/AuthComponents";
import { Instruction } from "@ring/ui/Components";
import PasswordInput from "@ring/ui/PasswordInput";
import PasswordEvaluate from "../custom/PasswordEvaluate";

const ReCaptcha = lazy(() => import("@ring/auth/ReCaptcha"));

const ResetTab = ({
  resetToken,
  pending,
  setPending,
  reCaptchaLoaded,
  generateReCaptchaToken,
}) => {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // Password validation
  const [password, setPassword] = useState("");
  const [validPass, setValidPass] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [matchPass, setMatchPass] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [err, setErr] = useState([]);

  // Other
  const errRef = useRef();
  const navigate = useNavigate();

  // Recaptcha v2
  const [challenge, setChallenge] = useState(false); // Toggle if marked suspicious by v3
  const [token, setToken] = useState("");

  // Reset mutation
  const [reset, { isLoading: reseting }] = useResetMutation();

  // Password
  useEffect(() => {
    const match = password === matchPass;
    setValidMatch(match);
  }, [matchPass]);

  // Error message reset when reinput stuff
  useEffect(() => {
    setErrMsg("");
  }, [password, matchPass]);

  // Reset passowrd
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reseting || pending) return;

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    const recaptchaToken = challenge
      ? token
      : await generateReCaptchaToken("reset");
    reset({
      token: recaptchaToken,
      source: challenge ? "v2" : "v3",
      resetToken,
      resetBody: {
        newPass: password,
        newPassRe: matchPass,
      },
    })
      .unwrap()
      .then((data) => {
        // Reset input
        setPassword("");
        setMatchPass("");
        setErr([]);
        setErrMsg("");
        setChallenge(false);

        // Queue snack
        enqueueSnackbar("Đổi mật khẩu thành công!", { variant: "success" });
        navigate("/auth/login");
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
          setErrMsg(err?.data?.message ?? "Sai định dạng thông tin!");
        } else if (err?.status === 404) {
          setErrMsg("Link không hợp lệ!");
        } else if (err?.status === 403) {
          setErrMsg("Bạn không có quyền làm điều này!");
        } else if (err?.status === 412) {
          setChallenge(true);
          setErrMsg("Yêu cầu của bạn cần xác thực lại!");
        } else {
          setErrMsg("Khôi phục thất bại!");
        }
        errRef.current.focus();
        setPending(false);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <AuthTitle>Khôi phục mật khẩu</AuthTitle>
      <Instruction ref={errRef} aria-live="assertive">
        {errMsg != "" ? errMsg : " "}&nbsp;
      </Instruction>
      <Stack spacing={2.5} direction="column">
        <PasswordInput
          label="Mật khẩu mới"
          size="small"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          aria-invalid={validPass ? "false" : "true"}
          onFocus={() => setPassFocus(true)}
          onBlur={() => setPassFocus(false)}
          error={(password && !validPass) || err?.data?.errors?.newPass}
          helperText={
            passFocus && password && !validPass
              ? "8 đến 24 kí tự."
              : err?.data?.errors?.newPass
          }
        />
        <PasswordInput
          label="Nhập lại mật khẩu mới"
          size="small"
          onChange={(e) => setMatchPass(e.target.value)}
          value={matchPass}
          aria-invalid={validMatch ? "false" : "true"}
          error={(matchPass && !validMatch) || err?.data?.errors?.newPassRe}
          helperText={
            matchPass && !validMatch
              ? "Không trùng mật khẩu."
              : err?.data?.errors?.newPassRe
          }
        />
        <PasswordEvaluate
          {...{ password, onValid: (value) => setValidPass(value) }}
        />
        {reCaptchaLoaded && challenge && (
          <Suspense fallback={null}>
            <ReCaptcha
              onVerify={(token) => setToken(token)}
              recaptchaSiteKey={recaptchaSiteKey}
            />
          </Suspense>
        )}
        <div style={{ width: "100%" }}>
          <ConfirmButton
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={!validPass || !validMatch || !reCaptchaLoaded}
          >
            Khôi phục
          </ConfirmButton>
        </div>
      </Stack>
    </form>
  );
};

export default ResetTab;
