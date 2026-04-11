"use client";

import { Box, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useLocale, useTranslations } from "next-intl";
import { currencyFormat } from "@ring/shared";
import { useGetSalesQuery } from "@/features/orders/ordersApiSlice";

interface SalesLineChartProps {
  bookId: number;
  shopId?: number;
  startDate?: Date;
  endDate?: Date;
}

function formatYearMonthToLocale(value: string, locale: string = "en-US"): string {
  const [year, month] = value.split("-").map(Number);

  if (!year || !month || month < 1 || month > 12) {
    throw new Error("Invalid yyyy-MM value");
  }

  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function SalesLineChart({ bookId, shopId, startDate, endDate }: SalesLineChartProps) {
  const t = useTranslations();
  const theme = useTheme();
  const locale = useLocale();
  const startRange = startDate ?? new Date(new Date().setMonth(new Date().getMonth() - 1));
  const endRange = endDate ?? new Date(new Date().setMonth(new Date().getMonth() + 1));

  const queryArgs = {
    bookId: String(bookId),
    shopId: shopId ? String(shopId) : undefined,
    startDate: startRange.toLocaleDateString("sv"),
    endDate: endRange.toLocaleDateString("sv"),
  };

  const { data, isLoading } = useGetSalesQuery(queryArgs, { skip: !bookId });

  return (
    <Box>
      <LineChart
        height={190}
        hideLegend
        loading={isLoading}
        localeText={{ loading: t("loading") }}
        margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
        xAxis={[
          {
            scaleType: "point",
            data: data?.months ?? [],
            disableLine: true,
            disableTicks: true,
            tickLabelStyle: { fontSize: 11 },
            valueFormatter: (value, context) =>
              context.location === "tick" ? value : formatYearMonthToLocale(value, locale),
          },
        ]}
        yAxis={[{ position: "none" }]}
        series={[
          {
            id: "orders",
            data: data?.sales ?? [],
            area: true,
            curve: "monotoneX",
            color: theme.palette.success.main,
            valueFormatter: (value) => currencyFormat.format(value ?? 0),
          },
        ]}
        sx={{
          "width": "100%",
          "& .MuiAreaElement-root": {
            fillOpacity: 0.3,
          },
        }}
      />
    </Box>
  );
}
