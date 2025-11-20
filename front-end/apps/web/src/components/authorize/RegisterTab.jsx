import { useState, useRef, useEffect, Suspense, lazy } from "react";
import { Grow, Paper, Stack, TextField } from "@mui/material";
import { useRegisterMutation } from "../../features/auth/authApiSlice";
import { USER_REGEX, EMAIL_REGEX } from "@ring/shared/utils/regex";
import { AuthHighlight, AuthText, AuthTitle, ConfirmButton, TermText } from "@ring/ui/AuthComponents";
import { Link } from "react-router";
import { Instruction } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash-es";
import PasswordInput from "@ring/ui/PasswordInput";
import PasswordEvaluate from "../custom/PasswordEvaluate";

const ReCaptcha = lazy(() => import("@ring/auth/ReCaptcha"));

const RegisterTab = ({ pending, setPending, reCaptchaLoaded, generateReCaptchaToken }) => {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const userRef = useRef();
  const errRef = useRef();
  const { t } = useTranslation();

  // User validation
  const [username, setUsername] = useState(""); // user input
  const [validName, setValidName] = useState(false); // check name validate or not
  const [userFocus, setUserFocus] = useState(false); // focus on field or not

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

  // Recaptcha v2
  const [challenge, setChallenge] = useState(false); // Toggle if marked suspicious by v3
  const [token, setToken] = useState("");

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
    if (pending || !reCaptchaLoaded) return;

    // Validation
    const v1 = USER_REGEX.test(username);
    const v2 = EMAIL_REGEX.test(email);

    if (!v1 || !v2) {
      setErrMsg("Sai định dạng thông tin!");
      return;
    }
    setPending(true);

    const { enqueueSnackbar } = await import("notistack");

    const recaptchaToken = challenge ? token : await generateReCaptchaToken("register");
    register({
      token: recaptchaToken,
      source: challenge ? "v2" : "v3",
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
        setChallenge(false);

        // Queue snack
        enqueueSnackbar(t("message.success", { action: t("signup") }), { variant: "success" });
        setPending(false);
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(t("message.error", { action: t("signup") }), { variant: "error" });
        setErr(err);
        if (!err?.status) {
          setErrMsg(t("error.server.not.response"));
        } else {
          setErrMsg(err?.data?.message);
          if (err?.status === 412) setChallenge(true);
        }
        errRef.current.focus();
        setPending(false);
      });
  };

  const validRegister = [validName, validPass, validMatch, validEmail].every(Boolean);

  return (
    <form style={{ maxHeight: 560 }} onSubmit={handleSubmit}>
      <AuthTitle>{t("signup.title")}</AuthTitle>
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
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          aria-invalid={validName ? "false" : "true"}
          onFocus={() => setUserFocus(true)}
          onBlur={() => setUserFocus(false)}
          error={(username && !validName) || err?.data?.errors?.username != null}
        />
        <TextField
          label={
            email && !validEmail
              ? capitalize(t("validation.constraints.pattern", { ns: "validation", field: t("email") }))
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
        <Stack spacing={{ xs: 0.8, md: 1.5 }} direction={challenge ? "row" : "column"} position="relative">
          <div style={{ width: "100%s" }}>
            <PasswordInput
              label={err?.data?.errors?.pass ?? t("password")}
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
        {reCaptchaLoaded && challenge && (
          <Suspense fallback={null}>
            <ReCaptcha onVerify={(token) => setToken(token)} recaptchaSiteKey={recaptchaSiteKey} />
          </Suspense>
        )}
        <TermText>
          {t("recaptcha")}
          <br />
          <a href="https://policies.google.com/terms">
            <AuthHighlight color="warning">{t("terms")}</AuthHighlight>
          </a>
          &nbsp;&&nbsp;
          <a href="https://policies.google.com/privacy">
            <AuthHighlight color="warning">{t("policy")}</AuthHighlight>
          </a>
        </TermText>
        <ConfirmButton
          variant="contained"
          color="primary"
          type="submit"
          aria-label="submit register"
          disabled={!validRegister || isLoading || !reCaptchaLoaded}
        >
          {t("signup")}
        </ConfirmButton>
      </Stack>
      <AuthText>
        {t("login.suggestions")}&nbsp;
        <Link to={"/auth/login"}>
          <AuthHighlight>{t("login")}</AuthHighlight>
        </Link>
      </AuthText>
    </form>
  );
};

export default RegisterTab;
