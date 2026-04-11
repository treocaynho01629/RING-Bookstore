"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export interface WelcomeCardProps {
  username?: string;
}

export default function WelcomeCard({ username }: WelcomeCardProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        minHeight: 180,
        border: "0.5px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        backgroundImage: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.dark}04 100%)`,
      }}
    >
      <Box display="flex" flexDirection="column" height="100%" justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {t("dashboard.welcome.title")}, {username || t("dashboard.guest")}!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
            {t("dashboard.welcome.message")}
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<TrendingUp />}
            onClick={() => router.push("/order")}
          >
            {t("dashboard.viewOrders")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
