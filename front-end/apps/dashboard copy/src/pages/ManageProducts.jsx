import { useState, Suspense, lazy } from "react";
import { Box, Button, Grid } from "@mui/material";
import { Add, AutoStories, LocalFireDepartment } from "@mui/icons-material";
import { NavLink } from "react-router";
import { HeaderContainer } from "../components/custom/Components";
import { booksApiSlice, useGetBookAnalyticsQuery, useGetBooksQuery } from "../features/books/booksApiSlice";
import useTitle from "@ring/shared/useTitle";
import useAuth from "@ring/auth/useAuth";
import TableProducts from "../components/table/TableProducts";
import InfoCard from "../components/custom/InfoCard";
import CustomBreadcrumbs from "../components/custom/CustomBreadcrumbs";
import ProductsShowcase from "../components/product/ProductsShowcase";

const ProductFormDialog = lazy(() => import("../components/dialog/ProductFormDialog"));
const PendingModal = lazy(() => import("@ring/ui/PendingModal"));

const ManageProducts = () => {
  const { id, shop, roles } = useAuth();
  const isAdmin = roles?.find((role) => ["ROLE_ADMIN", "ROLE_GUEST"].includes(role));
  const [contextProduct, setContextProduct] = useState(null);
  const [open, setOpen] = useState(undefined);
  const [pending, setPending] = useState(false);
  const { data: bookAnalytics } = useGetBookAnalyticsQuery(
    { shopId: shop ?? null, userId: isAdmin ? null : id },
    { skip: !id }
  );
  const {
    data: bestSeller,
    isLoading: loadBest,
    isSuccess: doneBest,
    isError: errorBest,
  } = useGetBooksQuery(
    {
      size: 6,
      sortBy: "totalOrders",
      sortDir: "desc",
      amount: 0,
      shopId: shop ?? "",
      userId: isAdmin ? null : id,
    },
    { skip: !id }
  );
  const [getBook, { isLoading }] = booksApiSlice.useLazyGetBookQuery();

  //Set title
  //useTitle("Sản phẩm");

  const handleOpen = () => {
    setContextProduct(null);
    setOpen(true);
  };

  const handleOpenEdit = (productId) => {
    getBook(productId)
      .unwrap()
      .then((book) => {
        setContextProduct(book);
        setOpen(true);
      })
      .catch((rejected) => console.error(rejected));
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {(isLoading || pending) && (
        <Suspense fallBack={null}>
          <PendingModal open={isLoading || pending} message="Đang gửi yêu cầu..." />
        </Suspense>
      )}
      <HeaderContainer>
        <div>
          <h2>Quản lý sản phẩm</h2>
          <CustomBreadcrumbs separator="." maxItems={4} aria-label="breadcrumb">
            <NavLink to={"/product"}>Quản lý sản phẩm</NavLink>
          </CustomBreadcrumbs>
        </div>
        <Button variant="outlined" startIcon={<Add />} onClick={handleOpen}>
          Thêm
        </Button>
      </HeaderContainer>
      <Box mb={3}>
        <InfoCard icon={<AutoStories color="primary" />} info={bookAnalytics} color="primary" />
      </Box>
      <Grid container spacing={3} sx={{ marginBottom: "20px" }}>
        {loadBest ? null : (
          <Grid size={{ xs: 12, sm: 6 }}>
            <ProductsShowcase
              {...{
                title: (
                  <>
                    <LocalFireDepartment />
                    Top sản phẩm bán chạy
                  </>
                ),
                size: 6,
                data: bestSeller,
                isLoading: loadBest,
                isSuccess: doneBest,
                isError: errorBest,
              }}
            />
          </Grid>
        )}
      </Grid>
      <TableProducts {...{ shop, isAdmin, userId: id, handleOpenEdit, pending, setPending }} />
      <Suspense fallback={null}>
        {open !== undefined && (
          <ProductFormDialog
            {...{
              open,
              handleClose,
              shop,
              product: contextProduct,
              pending,
              setPending,
            }}
          />
        )}
      </Suspense>
    </>
  );
};

export default ManageProducts;
