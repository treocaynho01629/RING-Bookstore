"use client";

import { Box, Button, Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { LocalFireDepartment, TrendingUp } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import useShop from "@/hooks/useShop";
import WelcomeCard from "@/components/custom/WelcomeCard";
import ChartSales from "@/components/chart/ChartSales";
import ProductsShowcase from "@/components/product/ProductsShowcase";
import StatCard from "@/components/dashboard/StatCard";
import { useGetBooksQuery } from "@/features/books/booksApiSlice";
import { useGetReceiptsQuery } from "@/features/orders/ordersApiSlice";
import { useGetBookAnalyticsQuery } from "@/features/books/booksApiSlice";
import { useGetUserAnalyticsQuery } from "@/features/users/usersApiSlice";
import { currencyFormat, numFormat } from "@ring/shared";

const TopProducts = ({ shop }: { shop: number | null }) => {
  const t = useTranslations();
  const { data, isLoading, isSuccess, isError } = useGetBooksQuery({
    size: 6,
    sortBy: "totalOrders",
    sortDir: "desc",
    amount: 0,
    shopId: shop ?? "",
  } as any);

  return (
    <ProductsShowcase
      title={
        <>
          <LocalFireDepartment />
          &nbsp;{t("dashboard.topProducts")}
        </>
      }
      data={data}
      isLoading={isLoading}
      isSuccess={isSuccess}
      isError={isError}
    />
  );
};

export default function DashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const { shop } = useShop();
  const { data: session } = useSession();
  const { id, username, isAdmin } = session?.user ?? {
    id: null,
    username: null,
    isAdmin: false,
  };

  const shopId = shop?.id ?? undefined;
  const userId = id ? Number(id) : undefined;

  const { data: bookStat, isLoading: loadingBooks } = useGetBookAnalyticsQuery(
    { shopId, userId: isAdmin ? undefined : userId },
    { skip: !id }
  );
  const { data: userStat, isLoading: loadingUsers } = useGetUserAnalyticsQuery(undefined, { skip: !isAdmin });
  const { data: receiptsData } = useGetReceiptsQuery(
    {
      page: 0,
      size: 5,
      sortBy: "createdDate",
      sortDir: "desc",
      shopId: isAdmin ? undefined : shopId,
    },
    { skip: !id }
  );

  const recentReceipts = Object.values(receiptsData?.entities ?? {});

  return (
    <Box sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Grid container spacing={2}>
        {/* Welcome + Featured row */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <WelcomeCard username={username ?? ""} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: "100%",
              minHeight: 160,
              border: "0.5px solid",
              borderColor: "divider",
              borderRadius: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("dashboard.quickStats")}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => router.push("/product")} sx={{ mt: 1 }}>
              {t("product.management")}
            </Button>
            <Button variant="outlined" color="primary" onClick={() => router.push("/order")} sx={{ mt: 1 }}>
              {t("order.management")}
            </Button>
          </Paper>
        </Grid>

        {/* KPI cards */}
        {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title={t("dashboard.sales")}
            value={loadingSales ? <Skeleton width={80} /> : currencyFormat.format(salesStat?.value ?? 0)}
            diff={salesStat?.diff}
            icon={<TrendingUp />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title={t("dashboard.productsSold")}
            value={loadingBooks ? <Skeleton width={60} /> : numFormat.format(bookStat?.value ?? 0)}
            diff={bookStat?.diff}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title={t("dashboard.totalUsers")}
            value={loadingUsers ? <Skeleton width={60} /> : numFormat.format(userStat?.value ?? 0)}
            diff={userStat?.diff}
            skip={!isAdmin}
          />
        </Grid> */}

        {/* Yearly sales chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartSales shop={shopId} title={t("dashboard.yearlySales")} />
        </Grid>

        {/* Recent orders */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: "100%",
              minHeight: 320,
              border: "0.5px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                pb: 1.5,
                mb: 2,
                borderBottom: "0.5px solid",
                borderColor: "primary.main",
              }}
            >
              {t("dashboard.recentOrders")}
            </Typography>
            <Stack spacing={1.5}>
              {recentReceipts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.noRecentOrders")}
                </Typography>
              ) : (
                recentReceipts.slice(0, 5).map((r: any) => (
                  <Box
                    key={r?.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                      px: 1.5,
                      borderRadius: 1,
                      bgcolor: "action.hover",
                    }}
                  >
                    <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                      #{r?.id}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {currencyFormat.format(r?.total ?? 0)}
                    </Typography>
                  </Box>
                ))
              )}
            </Stack>
            <Button size="small" sx={{ mt: 2 }} onClick={() => router.push("/order")}>
              {t("general.view")} →
            </Button>
          </Paper>
        </Grid>

        {/* Top products */}
        <Grid size={12}>
          <TopProducts shop={shop?.id ?? null} />
        </Grid>
      </Grid>
    </Box>
  );
}
