"use client";

import { AutoStories, Group, AttachMoney, Storefront, LocalFireDepartment } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useSession } from "next-auth/react";
import { useGetBookAnalyticsQuery, useGetBooksQuery } from "../../features/books/booksApiSlice";
import { useGetUserAnalyticsQuery } from "../../features/users/usersApiSlice";
import { useGetSalesAnalyticsQuery } from "../../features/orders/ordersApiSlice";
import { useGetShopAnalyticsQuery } from "../../features/shops/shopsApiSlice";
import useShop from "../../hooks/useShop";
import ChartSales from "../../components/chart/ChartSales";
import WelcomeCard from "../../components/custom/WelcomeCard";
import InfoCard from "../../components/custom/InfoCard";
import SummaryTableProducts from "../../components/table/SummaryTableProducts";
import SummaryTableOrders from "../../components/table/SummaryTableOrders";
import SummaryTableUsers from "../../components/table/SummaryTableUsers";
import SummaryTableShops from "../../components/table/SummaryTableShops";
import ProductsShowcase from "../../components/product/ProductsShowcase";

const TopProducts = ({ shop }: { shop: number | null }) => {
  const { data, isLoading, isSuccess, isError } = useGetBooksQuery({
    size: 6,
    sortBy: "totalOrders",
    sortDir: "desc",
    amount: 0,
    shopId: shop ?? "",
  } as any);

  return (
    <ProductsShowcase
      {...{
        title: (
          <>
            <LocalFireDepartment />
            Top sản phẩm bán chạy
          </>
        ),
        data,
        isLoading,
        isSuccess,
        isError,
      }}
    />
  );
};

const Dashboard = () => {
  const { shop } = useShop();
  const { data: session } = useSession();
  const { id, username, isAdmin } = session?.user ?? { id: null, username: null, isAdmin: false };
  const { data: bookAnalytics } = useGetBookAnalyticsQuery(
    { shopId: shop !== null ? String(shop) : null, userId: isAdmin ? null : id },
    { skip: !id }
  );
  const { data: salesAnalytics } = useGetSalesAnalyticsQuery(shop !== null ? String(shop) : null);
  const { data: userAnalytics } = useGetUserAnalyticsQuery(null);
  const { data: shopAnalytics } = useGetShopAnalyticsQuery(null);

  return (
    <>
      <Grid container size="grow" spacing={2} pt={2}>
        <Grid size={{ xs: 12, sm: 7 }}>
          <WelcomeCard username={username} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <p>STUFF</p>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md_lg: 3 }}>
          <InfoCard icon={<AutoStories color="primary" />} info={bookAnalytics} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md_lg: 3 }}>
          <InfoCard icon={<Storefront color="info" />} info={shopAnalytics} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md_lg: 3 }}>
          <InfoCard icon={<Group color="warning" />} info={userAnalytics} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md_lg: 3 }}>
          <InfoCard icon={<AttachMoney color="success" />} info={salesAnalytics} color="success" />
        </Grid>
        <Grid size={{ xs: 12, md_lg: 4 }}>
          <p>STUFF</p>
        </Grid>
        <Grid size={{ xs: 12, md_lg: 8 }}>
          <ChartSales shop={shop} />
        </Grid>
        <Grid size={{ xs: 12, md_lg: 7 }}>
          <SummaryTableShops />
        </Grid>
        <Grid size={{ xs: 12, md_lg: 5 }}>
          <TopProducts shop={shop} />
        </Grid>
        <Grid size={isAdmin ? { xs: 12, lg: 4 } : { xs: 12, lg: 6 }}>
          <SummaryTableOrders
            shopId={shop !== null && shop !== undefined ? String(shop) : undefined}
            bookId={undefined}
          />
        </Grid>
        <Grid size={isAdmin ? { xs: 12, md: 6, lg: 4 } : { xs: 12, lg: 6 }}>
          <SummaryTableProducts {...{ shop, userId: id, isAdmin }} />
        </Grid>
        {isAdmin && (
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SummaryTableUsers />
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default Dashboard;
