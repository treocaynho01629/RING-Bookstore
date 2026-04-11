"use client";

import { Suspense, lazy, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@mui/material/styles";
import usePendingModal from "@/hooks/usePendingModal";

const PendingModal = lazy(() => import("@ring/ui/PendingModal"));

export default function PendingOverlay() {
  const t = useTranslations();
  const { open, message } = usePendingModal();
  const theme = useTheme();
  const pendingMessage = useMemo(() => {
    try {
      return t(message);
    } catch {
      return message;
    }
  }, [message, t]);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <PendingModal open={open} message={pendingMessage} />
    </Suspense>
  );
}
