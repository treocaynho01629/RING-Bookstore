import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  SimpleHighlight,
  SimpleText,
  SimpleTitle,
  ConfirmButton,
  SimpleActionContainer,
} from "../custom/SimpleComponents";
import { useAuthenticateMutation } from "@ring/redux/authApiSlice";
import { Instruction } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import { useColorScheme, useMediaQuery } from "@mui/material";
import Turnstile from "@ring/auth/Turnstile";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Logout from "@mui/icons-material/Logout";
import PasswordInput from "@ring/ui/PasswordInput";
import Box from "@mui/material/Box";

const LoginTab = ({ pending, setPending }) => {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const { persist, username: loginedUser, setPersist } = useAuth();
  const [authenticate, { isLoading, isSuccess, isUninitialized }] = useAuthenticateMutation();
  const signOut = useLogout();
  const { t, i18n } = useTranslation();
  const { mode } = useColorScheme();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

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

  // Turnstile
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [token, setToken] = useState("");

  // Error
  const [errMsg, setErrMsg] = useState(location.state?.errorMsg || "");
  const [err, setErr] = useState([]);

  /**
   * Toggle persist login
   */
  const togglePersist = () => {
    setCurrPersist((prev) => !prev);
  };

  /**
   * Reset login form
   */
  const reset = () => {
    setValidName(true);
    setValidPass(true);
    setPassword("");
    setErrMsg("");
    setErr([]);
  };

  /**
   * Submit login form
   */
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    if (pending || !token) return;

    // Validation
    setValidName(username ? true : false);
    setValidPass(password ? true : false);
    if (!username || !password) return;

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    authenticate({
      token,
      source: "turnstile",
      persist: currPersist,
      credentials: { username, pass: password },
    })
      .unwrap()
      .then((data) => {
        // Set auth persist
        if (currPersist) setPersist(true);

        // Queue snack
        enqueueSnackbar(t("message.success", { action: t("login.label") }), { variant: "success" });
        navigate(from, { replace: true, state: fromState }); // Redirect to previous page
        reset();
      })
      .catch((err) => {
        console.error(err);
        setErr(err);
        if (!err?.status) {
          setErrMsg(t("error.server.response"));
        } else {
          setErrMsg(err?.data?.message);
        }
        errRef.current.focus();
        setPending(false);
      });
  };

  return isUninitialized && (persist || loginedUser) ? (
    <>
      <SimpleTitle>
        {t("hello")} {loginedUser}
      </SimpleTitle>
      <Button color="error" size="large" onClick={() => signOut()} startIcon={<Logout />}>
        {t("signout.end")}
      </Button>
    </>
  ) : (
    <form onSubmit={handleSubmitLogin}>
      <SimpleTitle>{t("login.title")}</SimpleTitle>
      <Instruction ref={errRef} aria-live="assertive">
        {err?.data?.errors?.username ? (
          <span>{err?.data?.errors?.username}</span>
        ) : !validName ? (
          <span>{t("validation.constraints.blank", { ns: "validation", field: t("username") })}</span>
        ) : null}
        {err?.data?.errors?.pass ? (
          <span>{err?.data?.errors?.pass}</span>
        ) : !validPass ? (
          <span>{t("validation.constraints.blank", { ns: "validation", field: t("password.label") })}</span>
        ) : null}
        <span>{errMsg != "" ? errMsg : " "}&nbsp;</span>
      </Instruction>
      <Stack spacing={2.25} direction="column">
        <TextField
          label={t("username")}
          type="text"
          id="username"
          autoComplete="username"
          size="small"
          onChange={(e) => {
            setUsername(e.target.value);
            if (e.target.value) setShowTurnstile(true);
          }}
          value={username}
        />
        <PasswordInput
          label={t("password.label")}
          autoComplete="password"
          size="small"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <Box sx={{ display: showTurnstile ? "block" : "none" }}>
            <Turnstile
            siteKey={turnstileSiteKey}
            onSuccess={(turnstileToken) => setToken(turnstileToken)}
            onExpire={() => setToken("")}
            action="login"
            size="flexible"
            theme={resolvedMode}
                lang={i18n.language}
            />
        </Box>
        <SimpleActionContainer className="persistCheck">
          <FormControlLabel
            control={
              <Checkbox checked={currPersist} onChange={togglePersist} disableRipple name="persist" color="primary" />
            }
            label={t("login.persist")}
          />
          <Link to={"/reset"}>
            <SimpleHighlight color="warning">{t("forgot.label")}</SimpleHighlight>
          </Link>
        </SimpleActionContainer>
        <ConfirmButton
          disabled={isLoading || isSuccess || pending || !token}
          variant="contained"
          color="primary"
          type="submit"
        >
          {t("login.label")}
        </ConfirmButton>
      </Stack>
      <SimpleText>
        {t("signup.suggestions")}&nbsp;
        <Link to={"/auth/register"}>
          <SimpleHighlight>{t("signup.label")}</SimpleHighlight>
        </Link>
      </SimpleText>
    </form>
  );
};

export default LoginTab;
