import { useEffect, useState } from "react";
import { useForgotMutation } from "../../features/auth/authApiSlice";
import { EMAIL_REGEX } from "@ring/shared/utils/regex";
import { Instruction } from "@ring/ui/Components";
import { SimpleTitle, ConfirmButton } from "../custom/SimpleComponents";
import { keyframes } from "@emotion/react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash-es";
import { useColorScheme, useMediaQuery } from "@mui/material";
import Turnstile from "@ring/auth/Turnstile";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import styled from "@emotion/styled";
import Box from "@mui/material/Box";

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
  padding-top: ${({ theme }) => theme.spacing(2)};
`;
//#endregion

const ForgotTab = ({ pending, setPending }) => {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const { t, i18n } = useTranslation();
  const { mode } = useColorScheme();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  // Initial value
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [sent, setSent] = useState(false);

  // Error
  const [err, setErr] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  // Turnstile
  const [token, setToken] = useState("");
  const [showTurnstile, setShowTurnstile] = useState(false);

  const [sendForgot, { isLoading: sending }] = useForgotMutation(); // Request forgot hook

  // Validation email
  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  /**
   * Handle submit forgot password
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending || pending || !token) return;

    // Validation
    if (!validEmail) {
      setErrMsg(capitalize(t("validation.constraints.pattern", { ns: "validation", field: t("email.label") })));
      return;
    }

    setPending(true);
    const { enqueueSnackbar } = await import("notistack");

    sendForgot({
      token,
      source: "turnstile",
      email,
    })
      .unwrap()
      .then((data) => {
        setEmail("");
        setErr([]);
        setErrMsg("");
        setSent(true);
        setToken("");

        enqueueSnackbar(t("message.sent"), { variant: "success" });
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
        setPending(false);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <SimpleTitle>{t("forgot.title")}</SimpleTitle>
      <Instruction aria-live="assertive">{errMsg != "" ? errMsg : " "}&nbsp;</Instruction>
      <Stack spacing={1} direction="column">
        {sent && (
          <NotificationContent>
            <MarkEmailReadOutlined />
            <b>{t("message.sent")}</b>
            <p>{t("forgot.suggestions")}</p>
          </NotificationContent>
        )}
        <TextField
          placeholder={t("forgot.email")}
          id="email"
          autoComplete="email"
          label={
            email && !validEmail
              ? capitalize(t("validation.constraints.pattern", { ns: "validation", field: t("email.label") }))
              : err?.data?.errors?.email
          }
          onChange={(e) => {
            setEmail(e.target.value);
            if (e.target.value) setShowTurnstile(true);
          }}
          value={email}
          fullWidth
          size="small"
          sx={{ my: 1 }}
          error={(email && !validEmail) || err?.data?.errors?.email}
        />
        <Box sx={{ display: showTurnstile ? "block" : "none" }}>
          <Turnstile
            siteKey={turnstileSiteKey}
            onSuccess={(turnstileToken) => setToken(turnstileToken)}
            onExpire={() => setToken("")}
            action="forgot"
            size="flexible"
            theme={resolvedMode}
            lang={i18n.language}
          />
        </Box>
        <ButtonContainer>
          <ConfirmButton
            sx={{ mr: 4 }}
            component={Link}
            to="/auth/login"
            variant="outlined"
            color="error"
            size="large"
            fullWidth
          >
            {t("back")}
          </ConfirmButton>
          <ConfirmButton
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            fullWidth
            disabled={!email || !validEmail || sending || !token}
          >
            {t("send")}
          </ConfirmButton>
        </ButtonContainer>
      </Stack>
    </form>
  );
};

export default ForgotTab;
