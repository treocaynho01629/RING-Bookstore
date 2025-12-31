import { styled } from "@mui/material/styles";
import { MenuItem, Skeleton, TextField, useTheme } from "@mui/material";
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Paper } from "@mui/material";
import { SsidChart } from "@mui/icons-material";
import { useGetSalesQuery } from "../../features/orders/ordersApiSlice";
import { currencyFormat } from "@ring/shared";
import { Title } from "../custom/Components";
import { useState } from "react";

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

const TooltipValue = styled("p")`
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

const tempData = [
  { name: "1", data: { discount: 0, sales: 0 } },
  { name: "12", data: { discount: 0, sales: 0 } },
];

function YearsSelect({ year, setYear }) {
  let yearsSelect = [];
  const currYear = new Date().getFullYear();

  for (let i = currYear; i > currYear - 5; i--) {
    yearsSelect.push(
      <MenuItem key={`year-${i}`} value={i}>
        {i}
      </MenuItem>
    );
  }

  return (
    <TextField select size="small" defaultValue={currYear} value={year} onChange={(e) => setYear(e.target.value)}>
      {yearsSelect}
    </TextField>
  );
}

const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    const discount = payload[0];
    const sales = payload[1];

    return (
      <TooltipContainer>
        <TooltipLabel>Tháng {label}</TooltipLabel>
        <TooltipValue color={sales.color}>
          Doanh thu:&emsp;<span>{currencyFormat.format(sales.value)}</span>
        </TooltipValue>
        <TooltipValue color={discount.color}>
          Giảm giá:&emsp;<span>{currencyFormat.format(-discount.value)}</span>
        </TooltipValue>
        <TooltipValue color={theme.palette.primary.main}>
          Tổng:&emsp;
          <span>{currencyFormat.format(sales.value - discount.value)}</span>
        </TooltipValue>
      </TooltipContainer>
    );
  }

  return null;
};

const ChartSales = ({ shop }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const axisFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    currencyDisplay: "narrowSymbol",
    notation: "compact",
    compactDisplay: "short",
  });
  const theme = useTheme();

  const { data, isLoading } = useGetSalesQuery({ year, shopId: shop ? String(shop) : undefined });
  const yearSales = data?.reduce(
    (result, month) => {
      let data = month?.data;
      result[0] += data?.discount;
      result[1] += data?.sales;
      return result;
    },
    [0, 0]
  );

  return (
    <Paper elevation={3} sx={{ px: { xs: 0, sm: 1 }, py: { xs: 1, sm: 2 }, width: "100%" }}>
      <TitleContainer>
        <Title>
          <SsidChart />
          &nbsp;Doanh thu hằng năm
        </Title>
        <YearsSelect {...{ year, setYear }} />
      </TitleContainer>
      <ResponsiveContainer height={350}>
        <AreaChart data={isLoading ? tempData : data} margin={{ right: 20 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.warning.light} stopOpacity={0.3} />
              <stop offset="95%" stopColor={theme.palette.warning.dark} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.light} stopOpacity={0.3} />
              <stop offset="95%" stopColor={theme.palette.primary.dark} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tickFormatter={(label) => `T${label}`} dy={10} tick={{ fontSize: 12 }} />
          <YAxis
            tickCount={6}
            domain={[0, 10000000]}
            tickFormatter={(label) => `${axisFormat.format(label)}`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip theme={theme} />} />
          <Legend
            verticalAlign="top"
            align="left"
            iconType="circle"
            iconSize={12}
            wrapperStyle={{ padding: "0 16px 32px" }}
            formatter={(value, entry, index) => (
              <LegendLabel>
                {value}&emsp;
                {isLoading ? (
                  <h3>
                    <Skeleton variant="text" width={120} />
                    &emsp;
                  </h3>
                ) : (
                  <h3>
                    {currencyFormat.format(yearSales ? yearSales[index] : 0)}
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
            fill="url(#colorUv)"
          />
          <Area
            strokeWidth={3}
            type="monotone"
            dataKey="data.sales"
            name="Doanh thu"
            stroke={theme.palette.primary.main}
            fill="url(#colorPv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ChartSales;
