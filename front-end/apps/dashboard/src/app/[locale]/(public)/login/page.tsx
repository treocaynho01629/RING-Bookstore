"use client";

import { signIn } from "next-auth/react";
import { useState, useRef } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  Typography,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { useColorScheme, useMediaQuery } from "@mui/material";
import { useTranslations, useLocale } from "next-intl";
import Turnstile from "@ring/auth/Turnstile";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { mode } = useColorScheme();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedMode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileLang = locale === "en" ? "en" : locale === "vi" ? "vi" : "auto";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [persist, setPersist] = useState(true);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Validation
  const [validName, setValidName] = useState(true);
  const [validPass, setValidPass] = useState(true);
  const errRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    setValidName(username ? true : false);
    setValidPass(password ? true : false);
    if (!username || !password) {
      setError(t("validation.constraints.blank", { field: t("username") }));
      return;
    }

    if (!token) {
      setError("Please complete the verification");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        persist,
        source: "turnstile",
        token,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        errRef.current?.focus();
      }
    } catch (err) {
      setError("An error occurred during login");
      setIsLoading(false);
      errRef.current?.focus();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            p: 4,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            {t("login.title")}
          </Typography>

          {(error || !validName || !validPass) && (
            <Alert severity="error" ref={errRef} role="alert">
              {error ||
                (!validName && t("validation.constraints.blank", { field: t("username") })) ||
                (!validPass && t("validation.constraints.blank", { field: t("password.label") })) ||
                " "}
            </Alert>
          )}

          <Stack spacing={2.25} direction="column">
            <TextField
              label={t("username")}
              type="text"
              id="username"
              autoComplete="username"
              size="small"
              fullWidth
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setValidName(true);
                setError("");
              }}
              error={!validName}
              required
            />

            <TextField
              label={t("password.label")}
              type="password"
              id="password"
              autoComplete="current-password"
              size="small"
              fullWidth
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidPass(true);
                setError("");
              }}
              error={!validPass}
              required
            />
            <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
              <Turnstile
                siteKey={turnstileSiteKey}
                onSuccess={(turnstileToken) => setToken(turnstileToken)}
                onExpire={() => setToken("")}
                action="login"
                size="flexible"
                theme={resolvedMode}
                lang={turnstileLang}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={persist}
                    onChange={(e) => setPersist(e.target.checked)}
                    disableRipple
                    name="persist"
                    color="primary"
                  />
                }
                label={t("login.persist")}
              />
              <MuiLink href="/reset" color="warning.main" underline="hover">
                {t("forgot.label")}
              </MuiLink>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading || !token}
              sx={{ mt: 2 }}
            >
              {isLoading ? t("loading") || "Loading..." : t("login.label")}
            </Button>
          </Stack>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            {t("signup.suggestions")}{" "}
            <MuiLink href="/auth/register" underline="hover">
              {t("signup.label")}
            </MuiLink>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
