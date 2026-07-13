import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Stack, useColorScheme, useMediaQuery } from "@mui/material";
import { useResetMutation } from "../../features/auth/authApiSlice";
import { SimpleTitle, ConfirmButton } from "../custom/SimpleComponents";
import { Instruction } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import Turnstile from "@ring/auth/Turnstile";
import PasswordInput from "@ring/ui/PasswordInput";
import PasswordEvaluate from "../custom/PasswordEvaluate";
import Box from "@mui/material/Box";

const ResetTab = ({ resetToken, pending, setPending }) => {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const { t, i18n } = useTranslation();
  const { mode } = useColorScheme();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

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

  // Turnstile
  const [token, setToken] = useState("");
  const [showTurnstile, setShowTurnstile] = useState(false);

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

  /**
   * Reset password submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reseting || pending || !token) return;

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    reset({
      token,
      source: "turnstile",
      resetToken,
      resetBody: {
        newPass: password,
        newPassRe: matchPass,
      },
    })
      .unwrap()
      .then((data) => {
        setPassword("");
        setMatchPass("");
        setErr([]);
        setErrMsg("");
        setToken("");

        enqueueSnackbar(t("message.success", { action: t("change.change.label") }), { variant: "success" });
        navigate("/auth/login");
        setPending(false);
      })
      .catch((err) => {
        console.error(err);
        setErr(err);
        if (!err?.status) {
          setErrMsg(t("error.server.response"));
        } else {
          setErrMsg(err?.data?.message);
        }
        errRef.current?.focus();
        setPending(false);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <SimpleTitle>{t("forgot.title")}</SimpleTitle>
      <Instruction ref={errRef} aria-live="assertive">
        {errMsg != "" ? errMsg : " "}&nbsp;
      </Instruction>
      <Stack spacing={2.25} direction="column">
        <PasswordInput
          label={
            passFocus && password && !validPass
              ? t("validation.constraints.size.range", {
                  ns: "validation",
                  min: 8,
                  max: 24,
                  field: t("password.label"),
                })
              : (err?.data?.errors?.newPass ?? t("change.new"))
          }
          size="small"
          onChange={(e) => {
            setPassword(e.target.value);
            if (e.target.value) setShowTurnstile(true);
          }}
          value={password}
          aria-invalid={validPass ? "false" : "true"}
          onFocus={() => setPassFocus(true)}
          onBlur={() => setPassFocus(false)}
          error={(password && !validPass) || err?.data?.errors?.newPass}
        />
        <PasswordInput
          label={
            matchPass && !validMatch
              ? t("validation.constraints.password.match", { ns: "validation" })
              : (err?.data?.errors?.newPassRe ?? t("change.confirm"))
          }
          size="small"
          onChange={(e) => setMatchPass(e.target.value)}
          value={matchPass}
          aria-invalid={validMatch ? "false" : "true"}
          error={(matchPass && !validMatch) || err?.data?.errors?.newPassRe}
        />
        <PasswordEvaluate {...{ password, onValid: (value) => setValidPass(value) }} />
        <Box sx={{ display: showTurnstile ? "block" : "none" }}>
          <Turnstile
            siteKey={turnstileSiteKey}
            onSuccess={(turnstileToken) => setToken(turnstileToken)}
            onExpire={() => setToken("")}
            action="reset"
            size="flexible"
            theme={resolvedMode}
            lang={i18n.language}
          />
        </Box>
        <div style={{ width: "100%" }}>
          <ConfirmButton
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!validPass || !validMatch || !token}
          >
            {t("forgot.submit")}
          </ConfirmButton>
        </div>
      </Stack>
    </form>
  );
};

export default ResetTab;
