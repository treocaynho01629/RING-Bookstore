"use client";

import { LocalFireDepartment } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useSession } from "next-auth/react";
import { useGetBooksQuery } from "../../../features/books/booksApiSlice";
import useShop from "../../../hooks/useShop";
import WelcomeCard from "../../../components/custom/WelcomeCard";
import ProductsShowcase from "../../../components/product/ProductsShowcase";

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
        {/* Template layout for e-commerce dashboard page */}

        {/* Welcome section */}
        <Grid size={{ xs: 12, sm: 7 }}>
          <WelcomeCard username={username ?? ""} />
        </Grid>

        {/* KPIs / Analytics Cards */}
        <Grid size={{ xs: 12, sm: 5 }} container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            {/* Replace with InfoCard (e.g. Total Products) */}
            <div
              style={{
                height: 100,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Product KPI
            </div>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            {/* Replace with InfoCard (e.g. Total Shops) */}
            <div
              style={{
                height: 100,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Shop KPI
            </div>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            {/* Replace with InfoCard (e.g. Total Users) */}
            <div
              style={{
                height: 100,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              User KPI
            </div>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            {/* Replace with InfoCard (e.g. Total Sales) */}
            <div
              style={{
                height: 100,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Sales KPI
            </div>
          </Grid>
        </Grid>

        {/* Row for charts and tables */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Replace with Chart, Recent Sales, etc. */}
          <div
            style={{
              height: 250,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Chart Placeholder
          </div>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Replace with Orders Table, Bestsellers, etc. */}
          <div
            style={{
              height: 250,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Table Placeholder
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
