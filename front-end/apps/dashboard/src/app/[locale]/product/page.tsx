"use client";

import { useState, Suspense, lazy, useMemo } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useGetBooksQuery } from "@/features/books/booksApiSlice";
import { MRT_ColumnDef, MRT_PaginationState, MRT_SortingState } from "material-react-table";
import { useSession } from "next-auth/react";
import Link from "next/link";
import useShop from "@/hooks/useShop";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import CustomReactTable from "@/components/table/CustomReactTable";
import type { BookResponse } from "@ring/redux/booksApiSlice";

const ProductFormDialog = lazy(() => import("@/components/dialog/ProductFormDialog"));
const PendingModal = lazy(() => import("@ring/ui/PendingModal"));

const ManageProducts = () => {
  const { data: session } = useSession();
  const { shop } = useShop();
  const { id, isAdmin } = session?.user ?? { id: null, isAdmin: false };
  const [contextProduct, setContextProduct] = useState(null);
  const [open, setOpen] = useState<boolean | undefined>(undefined);
  const [pending, setPending] = useState(false);
  const [filters, setFilters] = useState({
    keyword: "",
    cate: "",
    pubIds: [],
    types: [],
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const { data, isLoading, isSuccess, isError, error, isFetching } = useGetBooksQuery(
    {
      page: pagination?.pageIndex,
      size: pagination?.pageSize,
      // sortBy: sorting?.map((sort) => sort.id),
      // sortDir: sorting?.map((sort) => sort.desc ? "desc" : "asc"),
      shopId: shop?.id ?? undefined,
      userId: isAdmin ? undefined : id ? Number(id) : undefined,
      keyword: filters.keyword,
      cateId: filters.cate ? Number(filters.cate) : undefined,
      types: filters.types,
      pubIds: filters.pubIds,
      amount: 0,
    },
    { skip: !id }
  );

  const handleOpen = () => {
    setContextProduct(null);
    setOpen(true);
  };

  const handleOpenEdit = (productId: number) => {
    // getBook(productId)
    //   .unwrap()
    //   .then((book) => {
    //     setContextProduct(book);
    //     setOpen(true);
    //   })
    //   .catch((rejected) => console.error(rejected));
  };

  const handleClose = () => {
    setOpen(false);
  };

  const columns = useMemo<MRT_ColumnDef<BookResponse>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "price",
        header: "Price",
      },
      {
        accessorKey: "amount",
        header: "Amount",
      },
      {
        accessorKey: "shopName",
        header: "Shop Name",
      },
      {
        accessorKey: "rating",
        header: "Rating",
      },
    ],
    []
  );

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {(isLoading || pending) && (
        <Suspense fallback={<></>}>
          <PendingModal open={isLoading || pending} message="Đang gửi yêu cầu..." />
        </Suspense>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Quản lý sản phẩm
          </Typography>
          <CustomBreadcrumbs separator="." maxItems={4} aria-label="breadcrumb">
            <Link href={"/product"}>Quản lý sản phẩm</Link>
          </CustomBreadcrumbs>
        </Box>
        <Box sx={{ my: 3 }}>
          <Button variant="outlined" startIcon={<Add />} onClick={handleOpen}>
            Thêm
          </Button>
        </Box>
      </Box>
      <Box flex={1} position="relative">
        <Box position="absolute" top={0} left={0} height="100%" width="100%">
          <CustomReactTable
            columns={columns}
            data={Object.values(data?.entities ?? {})}
            tableOptions={{
              enableRowSelection: true,
              manualPagination: true,
              manualSorting: true,
              rowCount: data?.totalElements ?? 0,
              onPaginationChange: setPagination,
              onSortingChange: setSorting,
              state: {
                pagination,
                sorting,
                isLoading,
                showProgressBars: isFetching,
              },
              enableStickyHeader: true,
              initialState: { density: "compact" },
              layoutMode: "grid",
            }}
          />
        </Box>
      </Box>
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
    </Box>
  );
};

export default ManageProducts;
