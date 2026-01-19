"use client";

import { LocalFireDepartment } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useSession } from "next-auth/react";
import { useGetBooksQuery } from "../../features/books/booksApiSlice";
import useShop from "../../hooks/useShop";
import WelcomeCard from "../../components/custom/WelcomeCard";
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

  return (
    <>
      <Grid container size="grow" spacing={2} pt={2}>
        <Grid size={{ xs: 12, sm: 7 }}>
          <WelcomeCard username={username ?? ""} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <p>STUFF</p>
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 6, md_lg: 3 }}>
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
        </Grid> */}
      </Grid>
    </>
  );
};

export default Dashboard;
