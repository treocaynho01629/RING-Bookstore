"use client";

import { Box, styled, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { currencyFormat, dateFormatter, idFormatter, timeFormatter } from "@ring/shared";
import { useLocale, useTranslations } from "next-intl";
import { useGetSummariesQuery } from "@/features/orders/ordersApiSlice";
import { OrderStatus } from "@ring/shared/models/orderStatus";
import type { OrderSummaryDTO } from "@ring/shared/models/orderSummaryDTO";
import Placeholder from "@/components/custom/Placeholder";
import Link from "next/link";

const TableCellStyled = styled(TableCell)`
  border: none;
  padding: ${({ theme }) => theme.spacing(1, 0)};
`;

interface RecentOrdersComponentProps {
  id: string;
  enabled?: boolean;
}

export default function RecentOrdersComponent({ id, enabled = true }: RecentOrdersComponentProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { data, isLoading } = useGetSummariesQuery({ bookId: Number(id), page: 0, size: 5 }, { skip: !enabled || !id });

  const recentOrders: OrderSummaryDTO[] = data?.ids?.map((oId: number) => data?.entities?.[oId])?.filter(Boolean) ?? [];

  return (
    <Box position="relative" width="100%" height="100%">
      {isLoading ? (
        <Placeholder />
      ) : recentOrders.length > 0 ? (
        <>
          <Table size="small">
            <TableBody>
              {recentOrders.map((order) => {
                const date = new Date(order?.date ?? "");
                return (
                  <TableRow key={order?.id}>
                    <TableCellStyled>
                      <Link href={`/orders/${order?.id}`}>{idFormatter(Number(order?.id))}</Link>
                    </TableCellStyled>
                    <TableCellStyled>{order?.name}</TableCellStyled>
                    <TableCellStyled align="center">
                      <Typography
                        variant="body2"
                        color={
                          order?.status === OrderStatus.COMPLETED
                            ? "success.main"
                            : order?.status === OrderStatus.CANCELED
                              ? "error.main"
                              : "warning.main"
                        }
                      >
                        {order?.status === OrderStatus.COMPLETED
                          ? "+"
                          : order?.status === OrderStatus.CANCELED
                            ? "-"
                            : ""}
                        {currencyFormat.format(Number(order.totalPrice))}
                      </Typography>
                    </TableCellStyled>
                    <TableCellStyled align="right">{`${dateFormatter(date, locale)} - ${timeFormatter(date, locale)}`}</TableCellStyled>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {recentOrders?.length < 5 && (
            <Typography variant="body2" color="warning" align="center">
              {t("product.recent.orders.out")}
            </Typography>
          )}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center">
          {t("product.recent.orders.empty")}
        </Typography>
      )}
    </Box>
  );
}
