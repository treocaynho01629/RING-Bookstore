"use client";

import { useState } from "react";
import { styled, useTheme, type Theme } from "@mui/material/styles";
import { MenuItem, Paper, Skeleton, TextField } from "@mui/material";
import { SsidChart } from "@mui/icons-material";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipProps } from "recharts";
import { currencyFormat } from "@ring/shared";
import { Title } from "../custom/Components";
import { useGetSalesQuery } from "@/features/orders/ordersApiSlice";
import type { ChartDTO } from "@ring/shared/models/chartDTO";

//#region styled
const TooltipContainer = styled("div")`
  border: 0.5px solid ${({ theme }) => theme.palette.divider};
  background-color: ${({ theme }) => theme.palette.background.default};
  padding: ${({ theme }) => theme.spacing(1.5)};
`;

const TooltipLabel = styled("p")`
  margin: 0 0 8px;
  font-weight: 450;
  text-decoration: underline;
`;

const TooltipValue = styled("p")<{ color?: string }>`
  margin: 0;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  width: 100%;

  span {
    color: ${({ color }) => color};
  }
`;

const TitleContainer = styled("div")`
  padding: 0 ${({ theme }) => theme.spacing(2)};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LegendLabel = styled("span")`
  color: ${({ theme }) => theme.palette.text.primary};
  h3 {
    font-weight: 400;
    font-size: 18px;
    margin: 8px 0;
  }
`;
//#endregion

const TEMP_DATA: ChartDTO[] = [
  { name: "1", data: { discount: 0, sales: 0 } },
  { name: "12", data: { discount: 0, sales: 0 } },
];

interface YearsSelectProps {
  year: number;
  setYear: (year: number) => void;
}

interface SaleData {
  value: number;
  color: string;
}

function YearsSelect({ year, setYear }: YearsSelectProps) {
  const currYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currYear - i);

  return (
    <TextField select size="small" value={year} onChange={(e) => setYear(Number(e.target.value))}>
      {years.map((y) => (
        <MenuItem key={`year-${y}`} value={y}>
          {y}
        </MenuItem>
      ))}
    </TextField>
  );
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  theme: Theme;
  payload?: SaleData[];
  label?: string;
}

function CustomTooltip({ active, payload, label, theme }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const discount = payload[0];
  const sales = payload[1];
  const discountVal = discount?.value ?? 0;
  const salesVal = sales?.value ?? 0;

  return (
    <TooltipContainer>
      <TooltipLabel>Tháng {label}</TooltipLabel>
      <TooltipValue color={sales?.color}>
        Doanh thu:&emsp;<span>{currencyFormat.format(salesVal)}</span>
      </TooltipValue>
      <TooltipValue color={discount?.color}>
        Giảm giá:&emsp;<span>{currencyFormat.format(-discountVal)}</span>
      </TooltipValue>
      <TooltipValue color={theme.palette.primary.main}>
        Tổng:&emsp;
        <span>{currencyFormat.format(salesVal - discountVal)}</span>
      </TooltipValue>
    </TooltipContainer>
  );
}

export interface ChartSalesProps {
  shop?: number | string | null;
  title?: string;
}

export default function ChartSales({ shop, title }: ChartSalesProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const theme = useTheme();

  const axisFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    currencyDisplay: "narrowSymbol",
    notation: "compact",
    compactDisplay: "short",
  });

  const { data, isLoading } = useGetSalesQuery({
    year,
    shopId: shop ? String(shop) : undefined,
  });

  const yearSales = (data as ChartDTO[] | undefined)?.reduce<[number, number]>(
    (result, month) => {
      const d = month?.data;
      result[0] += d?.discount ?? 0;
      result[1] += d?.sales ?? 0;
      return result;
    },
    [0, 0]
  );

  const chartData = isLoading ? TEMP_DATA : (data ?? TEMP_DATA);

  return (
    <Paper
      elevation={0}
      sx={{
        px: { xs: 1, sm: 2 },
        py: 2,
        width: "100%",
        border: "0.5px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <TitleContainer>
        <Title>
          <SsidChart />
          &nbsp;{title ?? "Doanh thu hằng năm"}
        </Title>
        <YearsSelect year={year} setYear={setYear} />
      </TitleContainer>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ right: 20, top: 10 }}>
          <defs>
            <linearGradient id="chartSales-colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.warning.light} stopOpacity={0.3} />
              <stop offset="95%" stopColor={theme.palette.warning.dark} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="chartSales-colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.light} stopOpacity={0.3} />
              <stop offset="95%" stopColor={theme.palette.primary.dark} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tickFormatter={(label) => `T${label}`} dy={10} tick={{ fontSize: 12 }} />
          <YAxis
            tickCount={6}
            domain={[0, "auto"]}
            tickFormatter={(label) => axisFormat.format(label)}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip theme={theme} />} />
          <Legend
            verticalAlign="top"
            align="left"
            iconType="circle"
            iconSize={12}
            wrapperStyle={{ padding: "0 16px 32px" }}
            formatter={(value, _entry, index) => (
              <LegendLabel>
                {value}&emsp;
                {isLoading ? (
                  <h3>
                    <Skeleton variant="text" width={120} />
                    &emsp;
                  </h3>
                ) : (
                  <h3>
                    {currencyFormat.format(yearSales?.[index] ?? 0)}
                    &emsp;
                  </h3>
                )}
              </LegendLabel>
            )}
          />
          <Area
            strokeWidth={3}
            type="monotone"
            dataKey="data.discount"
            name="Giảm giá"
            stroke={theme.palette.warning.main}
            fill="url(#chartSales-colorUv)"
          />
          <Area
            strokeWidth={3}
            type="monotone"
            dataKey="data.sales"
            name="Doanh thu"
            stroke={theme.palette.primary.main}
            fill="url(#chartSales-colorPv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}
