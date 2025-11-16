import { Box, Breadcrumbs, Typography } from "@mui/material";
import { Link } from "react-router";
import { AttachMoney } from "@mui/icons-material";
import useTitle from "@ring/shared/useTitle";
import { useGetSalesAnalyticsQuery } from "../features/orders/ordersApiSlice";
import useAuth from "@ring/auth/useAuth";
import ChartSales from "../components/chart/ChartSales";
import TableOrders from "../components/table/TableOrders";
import InfoCard from "../components/custom/InfoCard";
// import CountCard from "../../components/custom/CountCard";

const ManageOrders = () => {
  const { shop } = useAuth();
  const { data: salesAnalytics } = useGetSalesAnalyticsQuery(shop ?? null);

  //Set title
  //useTitle("Doanh thu");

  return (
    <>
      <h2>Quản lý doanh thu</h2>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link style={{ color: "inherit" }} to="/">
            Dashboard
          </Link>
          <Typography color="text.secondary">Quản lý doanh thu</Typography>
        </Breadcrumbs>
      </Box>
      <Box mb={3}>
        <InfoCard icon={<AttachMoney color="success" />} info={salesAnalytics} color="success" />
      </Box>
      <Box mb={3}>
        <ChartSales shop={shop} />
      </Box>
      <TableOrders shop={shop} />
    </>
  );
};

export default ManageOrders;
