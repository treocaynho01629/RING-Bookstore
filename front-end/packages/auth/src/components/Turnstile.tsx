"use client";

import type { TurnstileInstance, TurnstileProps, WidgetSize } from "@marsidev/react-turnstile";
import { Turnstile as TurnstileWidget } from "@marsidev/react-turnstile";
import { useRef } from "react";

export type Theme = "light" | "dark" | "auto";
export type Size = "normal" | "compact" | "flexible" | "invisible";
export type Lang = "auto" | "en" | "vi";

interface Props extends Omit<TurnstileProps, "siteKey"> {
  theme?: Theme;
  size?: WidgetSize;
  lang?: Lang;
  siteKey?: string;
  action?: string;
}

const Turnstile = ({ theme, size, lang, siteKey, action, ...props }: Props) => {
  const turnstileRef = useRef<TurnstileInstance>(null);

  return (
    <TurnstileWidget
      {...props}
      ref={turnstileRef}
      options={{ theme, size, language: lang, action }}
      siteKey={siteKey ?? ""}
    />
  );
};

export default Turnstile;
