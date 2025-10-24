import { useEffect, useState, Suspense, lazy } from "react";
import { useForgotMutation } from "../../features/auth/authApiSlice";
import { EMAIL_REGEX } from "@ring/shared/utils/regex";
import { Instruction } from "@ring/ui/Components";
import { AuthTitle, ConfirmButton } from "@ring/ui/AuthComponents";
import { keyframes } from "@emotion/react";
import { Link } from "react-router";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import styled from "@emotion/styled";

const ReCaptcha = lazy(() => import("@ring/auth/ReCaptcha"));

//#region styled
const expand = keyframes`
    from { 
        height: 0;
        transform: scaleY(0) translateZ(0); 
    }
    to { 
        height: 'auto';
        transform: scaleY(1) translateZ(0); 
    }
`;

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.primary.main};
  padding: ${({ theme }) => theme.spacing(1)};
  animation: ${expand} 0.5s ease;
  overflow: hidden;

  svg {
    font-size: 80px;
    color: ${({ theme }) => theme.vars.palette.primary.main};
  }

  b {
    margin: ${({ theme }) => theme.spacing(2)};
  }

  p {
    margin: 0;
    margin-bottom: ${({ theme }) => theme.spacing(1)};
    color: ${({ theme }) => theme.vars.palette.text.secondary};
    font-size: 14px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing(3)};
`;
//#endregion

const ForgotTab = ({
  pending,
  setPending,
  reCaptchaLoaded,
  generateReCaptchaToken,
}) => {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // Initial value
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [sended, setSended] = useState(false);

  // Error
  const [err, setErr] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  // Recaptcha v2
  const [challenge, setChallenge] = useState(false); // Toggle if marked suspicious by v3
  const [token, setToken] = useState("");

  const [sendForgot, { isLoading: sending }] = useForgotMutation(); // Request forgot hook

  // Validation email
  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  // Forgot pass
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending || pending) return;

    setPending(true);

    // Validation
    if (!validEmail) {
      setErrMsg("Sai định dạng email!");
      return;
    }

    const { enqueueSnackbar } = await import("notistack");

    // Send mutation
    const recaptchaToken = challenge
      ? token
      : await generateReCaptchaToken("forgot");
    sendForgot({
      token: recaptchaToken,
      source: challenge ? "v2" : "v3",
      email,
    })
      .unwrap()
      .then((data) => {
        // Reset input
        setEmail("");
        setErr([]);
        setErrMsg("");
        setSended(true);
        setChallenge(false);

        // Queue snack
        enqueueSnackbar("Đã gửi yêu cầu về email!", { variant: "success" });
        setPending(false);
      })
      .catch((err) => {
        console.error(err);
        setErr(err);
        if (!err?.status) {
          setErrMsg("Server không phản hồi");
        } else if (err?.status === 404) {
          setErrMsg("Tài khoản với email này không tồn tại!");
        } else if (err?.status === 409) {
          setErrMsg(err?.data?.message);
        } else if (err?.status === 400) {
          setErrMsg(err?.data?.message ?? "Sai định dạng thông tin!");
        } else if (err?.status === 403) {
          setErrMsg("Lỗi xác thực!");
        } else if (err?.status === 412) {
          setChallenge(true);
          setErrMsg("Yêu cầu của bạn cần xác thực lại!");
        } else {
          setErrMsg("Gửi yêu cầu thất bại");
        }
        setPending(false);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <AuthTitle>Khôi phục mật khẩu</AuthTitle>
      <Instruction aria-live="assertive">
        {errMsg != "" ? errMsg : " "}&nbsp;
      </Instruction>
      <Stack spacing={1} direction="column">
        {sended && (
          <NotificationContent>
            <MarkEmailReadOutlined />
            <b>Email khôi phục đã được gửi</b>
            <p>Vui lòng kiểm tra email của bạn</p>
          </NotificationContent>
        )}
        <TextField
          placeholder="Nhập email tài khoản cần khôi phục"
          id="email"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          fullWidth
          size="small"
          style={{ margin: "8px 0" }}
          error={(email && !validEmail) || err?.data?.errors?.email}
          helperText={
            email && !validEmail
              ? "Email không hợp lệ!"
              : err?.data?.errors?.email
          }
        />
        {reCaptchaLoaded && challenge && (
          <Suspense fallback={null}>
            <ReCaptcha
              onVerify={(token) => setToken(token)}
              recaptchaSiteKey={recaptchaSiteKey}
            />
          </Suspense>
        )}
        <ButtonContainer>
          <Link
            to={"/auth/login"}
            style={{ width: "100%", marginRight: "8px" }}
          >
            <ConfirmButton
              variant="outlined"
              color="error"
              size="large"
              fullWidth
            >
              Quay lại
            </ConfirmButton>
          </Link>
          <ConfirmButton
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            fullWidth
            disabled={!email || !validEmail || sending || !reCaptchaLoaded}
          >
            Gửi email
          </ConfirmButton>
        </ButtonContainer>
      </Stack>
    </form>
  );
};

export default ForgotTab;
