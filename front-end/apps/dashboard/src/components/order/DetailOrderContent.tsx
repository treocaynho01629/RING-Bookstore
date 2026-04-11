"use client";

import { useState, useEffect } from "react";
import { styled, Theme } from "@mui/material/styles";
import {
  Box,
  Button,
  Stack,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  Info as InfoIcon,
  ReceiptLong as ReceiptIcon,
  Store as StoreIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { currencyFormat, dateFormatter, idFormatter } from "@ring/shared";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import { useChangeOrderStatusMutation, useGetReceiptQuery } from "@/features/orders/ordersApiSlice";
import type { ReceiptDTO } from "@ring/shared/models/receiptDTO";
import type { OrderDTO } from "@ring/shared/models/orderDTO";
import type { OrderItemDTO } from "@ring/shared/models/orderItemDTO";
import { OrderStatus } from "@ring/shared/models/orderStatus";

interface DetailOrderContentProps {
  receipt: ReceiptDTO | null;
  id: string;
}

const statusOptions = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PENDING,
  OrderStatus.SHIPPING,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELED,
  OrderStatus.PENDING_RETURN,
  OrderStatus.PENDING_REFUND,
  OrderStatus.REFUNDED,
];

//#region styled
const DetailContainer = styled(Box)`
  height: 100%;
  padding: 10px 20px;
  border: 0.5px solid ${({ theme }) => theme.vars?.palette?.divider};
  background-color: ${({ theme }) => theme.vars?.palette?.background?.paper};

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 0 12px;
  }
`;

const SectionCard = styled(DetailContainer)`
  padding: ${({ theme }) => theme.spacing(2.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const SectionTitle = styled(Box)`
  font-size: 16px;
  font-weight: 550;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  border-bottom: 0.5px solid ${({ theme }) => theme.palette.primary.main};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const InfoLabel = styled(TableCell)`
  width: 30%;
  white-space: nowrap;
  font-weight: 500;
  color: ${({ theme }) => theme.vars?.palette?.text?.secondary ?? theme.palette.text.secondary};
  font-size: 14px;
  border: none;
  padding: 8px 0;
  vertical-align: top;
`;

const InfoValue = styled(TableCell)`
  padding: ${({ theme }) => theme.spacing(1, 0, 1, 1.25)};
  font-size: 14px;
  border: none;
  vertical-align: top;
  color: ${({
    theme,
    color,
  }: {
    theme?: Theme;
    color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  }) =>
    color
      ? (theme?.vars?.palette?.[color]?.main ?? theme?.palette?.[color]?.main)
      : (theme?.vars?.palette?.text?.primary ?? theme?.palette?.text?.primary)};
`;

const InfoTable = styled(Table)`
  width: 100%;
  margin-top: 4px;

  tbody tr {
    border-bottom: none;
  }
`;
//#endregion

function formatMoney(value?: number | null): string {
  if (value == null) return "-";
  try {
    return currencyFormat.format(Number(value));
  } catch {
    return String(value);
  }
}

function getLineTotal(item: OrderItemDTO): number {
  const price = item.price ?? 0;
  const discount = item.discount ?? 0;
  const qty = item.quantity ?? 0;
  const finalPrice = price * (1 - discount);
  return finalPrice * qty;
}

export default function DetailOrderContent({ receipt: initialReceipt, id }: DetailOrderContentProps) {
  const t = useTranslations();
  const { data: fetchedReceipt, isLoading, isError } = useGetReceiptQuery(Number(id), { skip: !id });
  const receipt = initialReceipt ?? fetchedReceipt ?? null;
  const [orders, setOrders] = useState<OrderDTO[]>(receipt?.details ?? []);
  const [changeStatus] = useChangeOrderStatusMutation();

  useEffect(() => {
    if (receipt?.details) setOrders(receipt.details);
  }, [receipt?.details]);

  const handleStatusChange = async (orderId: number | undefined, status: string) => {
    if (!orderId) return;
    try {
      await changeStatus({ id: orderId, status }).unwrap();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: status as any } : o)));
    } catch {
      // ignore errors
    }
  };

  if (isLoading && !receipt) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if ((isError || !receipt) && !isLoading) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          {t("error.general")}
        </Typography>
      </Box>
    );
  }

  const finalTotal = (receipt?.total ?? 0) - (receipt?.totalDiscount ?? 0);

  const breadcrumbItems = [
    { label: t("order.management"), href: "/order" },
    { label: `${t("order.detail")} #${idFormatter(Number(id))}`, href: `/order/${id}` },
  ];

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <CustomBreadcrumbs items={breadcrumbItems} />
        </Box>
        <Stack direction="row" spacing={2}>
          <Button component={Link} href="/order" startIcon={<ArrowBack />} variant="outlined" color="warning">
            {t("back")}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <SectionCard>
            <SectionTitle>
              <ReceiptIcon fontSize="small" />
              {t("order.detail")} #{idFormatter(Number(receipt?.id ?? id))}
            </SectionTitle>
            <InfoTable>
              <TableBody>
                <TableRow>
                  <InfoLabel>{t("order.customer")}</InfoLabel>
                  <InfoValue>{receipt?.name || "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("review.user")}</InfoLabel>
                  <InfoValue>{receipt?.username || "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("order.email")}</InfoLabel>
                  <InfoValue>{receipt?.email || "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("order.phone")}</InfoLabel>
                  <InfoValue>{receipt?.phone || "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("order.address")}</InfoLabel>
                  <InfoValue>{receipt?.address || "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("order.date")}</InfoLabel>
                  <InfoValue>{receipt?.date ? dateFormatter(new Date(String(receipt.date))) : "-"}</InfoValue>
                </TableRow>
              </TableBody>
            </InfoTable>

            <Box mt={2}>
              <SectionTitle sx={{ borderBottom: "none", pb: 0, mb: 1, fontSize: 15 }}>
                <CartIcon fontSize="small" />
                {t("order.total")}
              </SectionTitle>
              <InfoTable>
                <TableBody>
                  <TableRow>
                    <InfoLabel>{t("order.total")}</InfoLabel>
                    <InfoValue>{formatMoney(receipt?.total)}</InfoValue>
                  </TableRow>
                  <TableRow>
                    <InfoLabel>{t("order.discount")}</InfoLabel>
                    <InfoValue color="error">-{formatMoney(receipt?.totalDiscount)}</InfoValue>
                  </TableRow>
                  <TableRow>
                    <InfoLabel>{t("total")}</InfoLabel>
                    <InfoValue color="primary">{formatMoney(finalTotal)}</InfoValue>
                  </TableRow>
                </TableBody>
              </InfoTable>
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <SectionCard>
            <SectionTitle>
              <InfoIcon fontSize="small" />
              {t("order.items")}
            </SectionTitle>
            <Stack spacing={2}>
              {orders.map((order) => (
                <Box
                  key={order.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <StoreIcon fontSize="small" />
                        {order.shopId ? (
                          <Link href={`/shop/${order.shopId}`}>{order.shopName}</Link>
                        ) : (
                          <Typography variant="subtitle1">{order.shopName}</Typography>
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {t("order.id")}: {idFormatter(Number(order.orderId ?? order.id))}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {order.status && (
                        <Chip
                          size="small"
                          label={t(`order.statuses.${order.status}`)}
                          color={
                            order.status === OrderStatus.COMPLETED
                              ? "success"
                              : order.status === OrderStatus.CANCELED
                                ? "error"
                                : "default"
                          }
                        />
                      )}
                      <TextField
                        select
                        size="small"
                        label={t("order.status")}
                        value={order.status ?? OrderStatus.PENDING}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        sx={{ minWidth: 170 }}
                      >
                        {statusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {t(`order.statuses.${status}`)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                  </Stack>

                  <InfoTable>
                    <TableBody>
                      <TableRow>
                        <InfoLabel>{t("order.total")}</InfoLabel>
                        <InfoValue>{formatMoney(order.totalPrice)}</InfoValue>
                      </TableRow>
                      <TableRow>
                        <InfoLabel>{t("cart.shipping.fee")}</InfoLabel>
                        <InfoValue>{formatMoney(order.shippingFee)}</InfoValue>
                      </TableRow>
                      <TableRow>
                        <InfoLabel>{t("cart.shipping.discount")}</InfoLabel>
                        <InfoValue color="error">-{formatMoney(order.shippingDiscount)}</InfoValue>
                      </TableRow>
                      <TableRow>
                        <InfoLabel>{t("cart.product.discount")}</InfoLabel>
                        <InfoValue color="error">
                          -{formatMoney((order.totalDiscount ?? 0) - (order.shippingDiscount ?? 0))}
                        </InfoValue>
                      </TableRow>
                    </TableBody>
                  </InfoTable>

                  <Box mt={1.5}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t("order.items")}
                    </Typography>
                    <Stack spacing={0.75}>
                      {order.items?.map((item) => (
                        <Box key={item.id} display="flex" justifyContent="space-between" gap={2}>
                          <Box>
                            {item.bookId ? (
                              <Link href={`/product/${item.bookId}`}>{item.bookTitle}</Link>
                            ) : (
                              <Typography variant="body2">{item.bookTitle}</Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {t("order.quantity")}: {item.quantity}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="body2">{formatMoney(getLineTotal(item))}</Typography>
                            {item.discount != null && item.discount > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                {formatMoney(item.price)} × {(1 - (item.discount ?? 0)) * 100}%
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                      {!order.items?.length && (
                        <Typography variant="body2" color="text.secondary">
                          {t("misc")}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Box>
              ))}
              {orders.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t("misc")}
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
