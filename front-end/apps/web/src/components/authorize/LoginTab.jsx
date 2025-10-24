import { useState, useRef, lazy, Suspense } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  AuthActionContainer,
  AuthHighlight,
  AuthText,
  AuthTitle,
  ConfirmButton,
} from "@ring/ui/AuthComponents";
import { useAuthenticateMutation } from "@ring/redux/authApiSlice";
import { Instruction } from "@ring/ui/Components";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Logout from "@mui/icons-material/Logout";
import PasswordInput from "@ring/ui/PasswordInput";

const ReCaptcha = lazy(() => import("@ring/auth/ReCaptcha"));

const LoginTab = ({
  pending,
  setPending,
  reCaptchaLoaded,
  generateReCaptchaToken,
}) => {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const { persist, username: loginedUser, setPersist } = useAuth();
  const [authenticate, { isLoading, isSuccess, isUninitialized }] =
    useAuthenticateMutation();
  const signOut = useLogout();

  // Router
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const fromState = location.state?.from?.state;
  const errRef = useRef();

  // Login value
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currPersist, setCurrPersist] = useState(true);

  // Validation
  const [validName, setValidName] = useState(true);
  const [validPass, setValidPass] = useState(true);

  // Recaptcha v2
  const [challenge, setChallenge] = useState(false); //Toggle if marked suspicious by v3
  const [token, setToken] = useState("");

  // Error
  const [errMsg, setErrMsg] = useState(location.state?.errorMsg || "");
  const [err, setErr] = useState([]);

  // Toggle persist
  const togglePersist = () => {
    setCurrPersist((prev) => !prev);
  };

  const reset = () => {
    setValidName(true);
    setValidPass(true);
    setPassword("");
    setErrMsg("");
    setErr([]);
  };

  // Login
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (pending || !reCaptchaLoaded) return;

    // Validation
    setValidName(username ? true : false);
    setValidPass(password ? true : false);
    if (!username || !password) return;

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    const recaptchaToken = challenge
      ? token
      : await generateReCaptchaToken("login");
    authenticate({
      token: recaptchaToken,
      source: challenge ? "v2" : "v3",
      persist: currPersist,
      credentials: { username, pass: password },
    })
      .unwrap()
      .then((data) => {
        // Set auth persist
        if (currPersist) setPersist(true);

        // Queue snack
        enqueueSnackbar("Đăng nhập thành công", { variant: "success" });
        navigate(from, { replace: true, state: fromState }); // Redirect to previous page
        reset();
      })
      .catch((err) => {
        console.error(err);
        setErr(err);
        if (!err?.status) {
          setErrMsg("Server không phản hồi");
        } else if (err?.status === 412) {
          setChallenge(true);
          setErrMsg(err?.data?.message);
        } else {
          setErrMsg(err?.data?.message);
        }
        errRef.current.focus();
        setPending(false);
      });
  };

  return isUninitialized && (persist || loginedUser) ? (
    <>
      <AuthTitle>Xin chào {loginedUser}</AuthTitle>
      <Button
        color="error"
        size="large"
        onClick={() => signOut()}
        startIcon={<Logout />}
      >
        Kết thúc phiên đăng nhập?
      </Button>
    </>
  ) : (
    <form onSubmit={handleSubmitLogin}>
      <AuthTitle>Đăng nhập tài khoản</AuthTitle>
      <Instruction ref={errRef} aria-live="assertive">
        {err?.data?.errors?.username ? (
          <span>{err?.data?.errors?.username}</span>
        ) : !validName ? (
          <span>Tên đăng nhập không được bỏ trống!</span>
        ) : null}
        {err?.data?.errors?.pass ? (
          <span>{err?.data?.errors?.pass}</span>
        ) : !validPass ? (
          <span>Mật khẩu không được bỏ trống!</span>
        ) : null}
        <span>{errMsg != "" ? errMsg : " "}&nbsp;</span>
      </Instruction>
      <Stack spacing={2.5} direction="column">
        <TextField
          label="Tên đăng nhập"
          type="text"
          id="username"
          autoComplete="username"
          size="small"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <PasswordInput
          label="Mật khẩu"
          autoComplete="password"
          size="small"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        {reCaptchaLoaded && challenge && (
          <Suspense fallback={null}>
            <ReCaptcha
              onVerify={(token) => setToken(token)}
              recaptchaSiteKey={recaptchaSiteKey}
            />
          </Suspense>
        )}
        <AuthActionContainer className="persistCheck">
          <FormControlLabel
            control={
              <Checkbox
                checked={currPersist}
                onChange={togglePersist}
                disableRipple
                name="persist"
                color="primary"
              />
            }
            label="Lưu đăng nhập"
          />
          <Link to={"/reset"}>
            <AuthHighlight color="warning">Quên mật khẩu?</AuthHighlight>
          </Link>
        </AuthActionContainer>
        <ConfirmButton
          disabled={isLoading || isSuccess || pending || !reCaptchaLoaded}
          variant="contained"
          color="primary"
          type="submit"
          aria-label="submit login"
        >
          Đăng nhập
        </ConfirmButton>
      </Stack>
      <AuthText>
        Chưa có tài khoản?&nbsp;
        <Link to={"/auth/register"}>
          <AuthHighlight>Đăng ký</AuthHighlight>
        </Link>
      </AuthText>
    </form>
  );
};

export default LoginTab;
