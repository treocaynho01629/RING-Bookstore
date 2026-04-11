"use client";

import { Box, Paper, Skeleton, Typography } from "@mui/material";
import { ReactNode } from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
  isLoading?: boolean;
}

export default function StatCard({ title, value, subtitle, trend, icon, isLoading }: StatCardProps) {
  const trendColor = trend === "up" ? "success.main" : trend === "down" ? "error.main" : "text.secondary";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        border: "0.5px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box flex={1}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={80} height={40} sx={{ mt: 0.5 }} />
          ) : (
            <Typography variant="h5" fontWeight={600} sx={{ mt: 0.5 }}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color={trendColor} sx={{ mt: 0.5, display: "block" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
