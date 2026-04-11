"use client";

import { Box, useTheme } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useTranslations } from "next-intl";
import { useGetReviewsAnalyticsQuery } from "@/features/reviews/reviewsApiSlice";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

const StyledText = styled("text")(({ theme }: { theme: Theme }) => ({
  fill: theme.vars?.palette?.text?.primary,
  textAnchor: "middle",
  dominantBaseline: "central",
  fontSize: 20,
}));

interface PieCenterLabelProps {
  children: React.ReactNode;
}

function PieCenterLabel({ children }: PieCenterLabelProps): React.ReactElement {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

interface ReviewsDistributionPieChartProps {
  bookId: number;
  shopId?: number;
}

export default function ReviewsDistributionPieChart({ bookId, shopId }: ReviewsDistributionPieChartProps) {
  const t = useTranslations();
  const theme = useTheme();
  const colors = [
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.primary.main,
    theme.palette.success.main,
  ];
  const { data, isLoading } = useGetReviewsAnalyticsQuery({ bookId, shopId }, { skip: !bookId });

  const rates = data?.rates ?? [0, 0, 0, 0, 0];
  const chartData = rates.map((count: number, index: number) => ({
    id: index + 1,
    label: `${index + 1}★`,
    value: count ?? 0,
    percentage: (count / (data?.total ?? 0)) * 100,
    color: colors[index] ?? theme.palette.secondary.main,
  }));

  return (
    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
      <PieChart
        height={260}
        series={[
          {
            data: chartData,
            innerRadius: "50%",
            outerRadius: "100%",
            highlightScope: { fade: "global", highlight: "item" },
            faded: { innerRadius: 50, additionalRadius: -10, color: "gray" },
            valueFormatter: (item) =>
              `${item.value}/${data?.total ?? 0} ${t("review.label")} ${(item as any).percentage.toFixed(0)}%`,
          },
        ]}
      >
        <PieCenterLabel>{isLoading ? t("loading") : `${data?.rating ?? 0} (${data?.total ?? 0})`}</PieCenterLabel>
      </PieChart>
    </Box>
  );
}
