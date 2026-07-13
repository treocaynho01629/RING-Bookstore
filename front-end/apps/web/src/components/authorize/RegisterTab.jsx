import { useState, useRef, useEffect } from "react";
import { Grow, Paper, Stack, TextField, useColorScheme, useMediaQuery } from "@mui/material";
import { useRegisterMutation } from "../../features/auth/authApiSlice";
import { USER_REGEX, EMAIL_REGEX } from "@ring/shared/utils/regex";
import { SimpleHighlight, SimpleText, TermText, SimpleTitle, ConfirmButton } from "../custom/SimpleComponents";
import { Link } from "react-router";
import { Instruction } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash-es";
import Turnstile from "@ring/auth/Turnstile";
import PasswordInput from "@ring/ui/PasswordInput";
import PasswordEvaluate from "../custom/PasswordEvaluate";
import Box from "@mui/material/Box";

const RegisterTab = ({ pending, setPending }) => {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const userRef = useRef();
  const errRef = useRef();
  const { t, i18n } = useTranslation();
  const { mode } = useColorScheme();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  // User validation
  const [username, setUsername] = useState(""); // User name input
  const [validName, setValidName] = useState(false); // Check name validate or not
  const [userFocus, setUserFocus] = useState(false); // Focus on field

  // Password validation
  const [password, setPassword] = useState("");
  const [validPass, setValidPass] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const [matchPass, setMatchPass] = useState("");
  const [validMatch, setValidMatch] = useState(false);

  // Email validation
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  // Error and success message
  const [errMsg, setErrMsg] = useState("");
  const [err, setErr] = useState([]);

  // Turnstile
  const [token, setToken] = useState("");
  const [showTurnstile, setShowTurnstile] = useState(false);

  // Register mutation
  const [register, { isLoading }] = useRegisterMutation();

  // Focus username
  useEffect(() => {
    userRef?.current?.focus();
  }, []);

  // Username validation
  useEffect(() => {
    const result = USER_REGEX.test(username);
    setValidName(result);
  }, [username]);

  //Password validation
  useEffect(() => {
    const match = password === matchPass;
    setValidMatch(match);
  }, [matchPass]);

  // Email validation
  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  // Error message reset when re-input stuff
  useEffect(() => {
    setErrMsg("");
  }, [username, email, password, matchPass]);

  // Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending || !token) return;

    // Validation
    const v1 = USER_REGEX.test(username);
    const v2 = EMAIL_REGEX.test(email);

    if (!v1 || !v2) {
      setErrMsg(t("validation.error.invalid.argument", { ns: "validation" }));
      return;
    }
    setPending(true);

    const { enqueueSnackbar } = await import("notistack");

    register({
      token,
      source: "turnstile",
      user: {
        username,
        pass: password,
        email,
      },
    })
      .unwrap()
      .then((data) => {
        // Reset input
        setUsername("");
        setPassword("");
        setMatchPass("");
        setEmail("");
        setErr([]);
        setErrMsg("");
        setToken("");

        // Queue snack
        enqueueSnackbar(t("message.success", { action: t("signup.label") }), { variant: "success" });
        setPending(false);
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(t("message.error", { action: t("signup.label") }), { variant: "error" });
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

  const validRegister = [validName, validPass, validMatch, validEmail].every(Boolean);

  return (
    <form style={{ maxHeight: 560 }} onSubmit={handleSubmit}>
      <SimpleTitle>{t("signup.title")}</SimpleTitle>
      <Instruction ref={errRef} aria-live="assertive">
        {errMsg != "" ? errMsg : " "}&nbsp;
      </Instruction>
      <Stack spacing={{ xs: 0.75, md: 1.5 }} mt={{ xs: 0.75, md: 1.5 }} direction="column">
        <TextField
          label={
            username && !validName
              ? t("validation.constraints.size.range", { ns: "validation", field: t("username"), min: 4, max: 24 })
              : (err?.data?.errors?.username ?? t("username"))
          }
          type="text"
          id="new-username"
          autoComplete="username"
          size="small"
          ref={userRef}
          onChange={(e) => {
            setUsername(e.target.value);
            if (e.target.value) setShowTurnstile(true);
          }}
          value={username}
          aria-invalid={validName ? "false" : "true"}
          onFocus={() => setUserFocus(true)}
          onBlur={() => setUserFocus(false)}
          error={(username && !validName) || err?.data?.errors?.username != null}
        />
        <TextField
          label={
            email && !validEmail
              ? capitalize(t("validation.constraints.pattern", { ns: "validation", field: t("email.label") }))
              : (err?.data?.errors?.email ?? t("email.placeholder"))
          }
          type="email"
          id="email"
          autoComplete="off"
          size="small"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          aria-invalid={validEmail ? "false" : "true"}
          onFocus={() => setEmailFocus(true)}
          onBlur={() => setEmailFocus(false)}
          error={(email && !validEmail) || err?.data?.errors?.email != null}
        />
        <Stack spacing={{ xs: 0.8, md: 1.5 }} direction="column" position="relative">
          <div style={{ width: "100%" }}>
            <PasswordInput
              label={err?.data?.errors?.pass ?? t("password.label")}
              size="small"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              aria-describedby="new password"
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
              fullWidth
              error={err?.data?.errors?.pass != null}
            />
            <Grow in={passFocus} style={{ transformOrigin: "0 0 0" }}>
              <Paper
                elevation={16}
                sx={{
                  position: "absolute",
                  bgcolor: "background.paper",
                  padding: 1,
                  marginBottom: 1,
                  marginTop: { xs: 0.4, md: 0.75 },
                  left: 0,
                  top: "50%",
                  zIndex: 2,
                  borderStyle: "solid",
                  borderColor: "divider",
                  borderWidth: 2,
                }}
              >
                <PasswordEvaluate {...{ password, onValid: (value) => setValidPass(value) }} />
              </Paper>
            </Grow>
          </div>
          <PasswordInput
            label={
              matchPass && !validMatch
                ? t("validation.constraints.password.match", { ns: "validation" })
                : t("password.confirm")
            }
            size="small"
            onChange={(e) => setMatchPass(e.target.value)}
            value={matchPass}
            aria-invalid={validMatch ? "false" : "true"}
            aria-describedby="confirm new password"
            error={(matchPass && !validMatch) || err?.data?.errors?.pass != null}
          />
        </Stack>
        <Box sx={{ display: showTurnstile ? "block" : "none" }}>
          <Turnstile
            siteKey={turnstileSiteKey}
            onSuccess={(turnstileToken) => setToken(turnstileToken)}
            onExpire={() => setToken("")}
            action="register"
            size="flexible"
            theme={resolvedMode}
            lang={i18n.language}
          />
        </Box>
        <TermText>
          {t("protected")}
          <br />
          <a href="https://www.cloudflare.com/website-terms/" target="_blank" rel="noopener noreferrer">
            <SimpleHighlight color="warning">{t("terms")}</SimpleHighlight>
          </a>
          &nbsp;&&nbsp;
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
            <SimpleHighlight color="warning">{t("policy")}</SimpleHighlight>
          </a>
        </TermText>
        <ConfirmButton
          variant="contained"
          color="primary"
          type="submit"
          disabled={!validRegister || isLoading || !token}
        >
          {t("signup.label")}
        </ConfirmButton>
      </Stack>
      <SimpleText>
        {t("login.suggestions")}&nbsp;
        <Link to={"/auth/login"}>
          <SimpleHighlight>{t("login.label")}</SimpleHighlight>
        </Link>
      </SimpleText>
    </form>
  );
};

export default RegisterTab;
