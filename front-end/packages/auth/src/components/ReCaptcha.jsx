"use client";

import Box from "@mui/material/Box";
import { useColorScheme } from "@mui/material/styles";
import { useEffect, useRef } from "react";

//ReCaptcha v2
//Only usable after v3 script already loaded
const ReCaptcha = ({ onVerify, onExpire, recaptchaSiteKey }) => {
  const { mode } = useColorScheme();
  const effectRan = useRef(false);
  const recaptchaId = useRef(null);
  const containerRef = useRef(null);

  // Render the reCAPTCHA widget
  useEffect(() => {
    if (effectRan.current) return;
    if (window.grecaptcha && containerRef.current && !recaptchaId.current) {
      render();
    }
    return () => (effectRan.current = true);
  }, [onVerify, onExpire]);

  const render = () => {
    recaptchaId.current = window.grecaptcha.render(containerRef.current, {
      sitekey: recaptchaSiteKey,
      theme: mode,
      callback: onVerify,
      "expired-callback": onExpire,
    });
  };

  //Reset widget
  const reset = () => {
    if (window.grecaptcha && recaptchaId.current !== null) {
      window.grecaptcha.reset(recaptchaId.current);
    }
  };

  return (
    <Box display="flex" justifyContent="center" my={2}>
      <Box
        bgcolor="white"
        p={0.1}
        sx={{ borderRadius: "3px", overflow: "hidden" }}
        ref={containerRef}
      ></Box>
    </Box>
  );
};

export default ReCaptcha;
