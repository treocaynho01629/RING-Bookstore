"use client";

import { useState, Suspense, lazy, useMemo } from "react";
import { Add, Delete, Edit, Star } from "@mui/icons-material";
import { Visibility } from "@mui/icons-material";
import { useGetBooksQuery } from "@/features/books/booksApiSlice";
import { MRT_ColumnDef, MRT_PaginationState, MRT_Row, MRT_SortingState, MRT_TableInstance } from "material-react-table";
import { useSession } from "next-auth/react";
import { getImageSrc } from "@ring/shared/enums/image";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { currencyFormat, idFormatter } from "@ring/shared";
import { useTranslations } from "next-intl";
import type { BookResponse } from "@ring/redux/booksApiSlice";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import useShop from "@/hooks/useShop";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import CustomReactTable from "@/components/table/CustomReactTable";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

const ProductFormDialog = lazy(() => import("@/components/dialog/ProductFormDialog"));
const PendingModal = lazy(() => import("@ring/ui/PendingModal"));

const ManageProducts = () => {
  const t = useTranslations();
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
      sortBy: sorting?.[0]?.id,
      sortDir: sorting?.[0]?.desc ? "desc" : "asc",
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
    console.log("test");
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
        header: t("general.id"),
        size: 80,
        Cell: ({ renderedCellValue }) => idFormatter(Number(renderedCellValue)),
      },
      {
        accessorKey: "title",
        header: t("product.title"),
        size: 400,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <LazyLoadImage
              src={row.original?.srcSet ? getImageSrc(row.original?.srcSet, 30) : undefined}
              height={30}
              width={30}
              placeholder={<Skeleton width={30} height={30} animation={false} variant="rectangular" />}
            />
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorKey: "price",
        header: t("product.price"),
        filterVariant: "range",
        size: 125,
        muiTableBodyCellProps: {
          align: "left",
        },
        Cell: ({ renderedCellValue }) => currencyFormat.format(Number(renderedCellValue)),
      },
      {
        accessorKey: "discount",
        header: t("product.discount"),
        filterVariant: "range",
        size: 140,
        Cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              width: "100%",
            }}
          >
            <span>{currencyFormat.format(-(row.original?.price ?? 0) * (row.original?.discount ?? 0))}</span>
            <Typography variant="caption" color="secondary">
              -{(row.original?.discount ?? 0) * 100}%
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "amount",
        header: t("quantity.label"),
        filterVariant: "range",
        size: 125,
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "shopName",
        header: t("product.shop"),
        size: 200,
      },
      {
        accessorKey: "rating",
        header: t("review.label"),
        filterVariant: "range",
        size: 125,
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <span>{(row.original?.rating ?? 0).toFixed(1)}</span>
            <Star color="warning" sx={{ fontSize: 16 }} />
          </Box>
        ),
      },
      {
        accessorKey: "totalOrders",
        header: t("product.orders"),
        filterVariant: "range",
        size: 125,
        muiTableBodyCellProps: {
          align: "left",
        },
      },
    ],
    []
  );

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {pending && (
        <Suspense fallback={<></>}>
          <PendingModal open={pending} message="Đang gửi yêu cầu..." />
        </Suspense>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {t("product.management")}
          </Typography>
          <CustomBreadcrumbs separator="." maxItems={4} aria-label="breadcrumb">
            <Link href={"/product"}>{t("product.management")}</Link>
          </CustomBreadcrumbs>
        </Box>
        <Box sx={{ my: 3 }}>
          <Button variant="outlined" startIcon={<Add />} onClick={handleOpen}>
            {t("general.add")}
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
                showAlertBanner: isError,
              },
              enableStickyHeader: true,
              initialState: {
                density: "compact",
                columnVisibility: { amount: false, shopName: false },
                columnPinning: { right: ["mrt-row-actions"] },
              },
              layoutMode: "semantic",
              enableRowActions: true,
              enableColumnPinning: true,
              enableColumnFilterModes: true,
              positionActionsColumn: "last",
              enableColumnResizing: true,
              renderRowActionMenuItems: ({ closeMenu }: { closeMenu: () => void }) => [
                <MenuItem
                  key={0}
                  onClick={() => {
                    closeMenu();
                  }}
                  sx={{ m: 0 }}
                >
                  <ListItemIcon>
                    <Visibility />
                  </ListItemIcon>
                  {t("general.view")}
                </MenuItem>,
                <MenuItem
                  key={1}
                  onClick={() => {
                    closeMenu();
                  }}
                  sx={{ m: 0 }}
                >
                  <ListItemIcon>
                    <Edit />
                  </ListItemIcon>
                  {t("update")}
                </MenuItem>,
                <MenuItem
                  key={2}
                  onClick={() => {
                    closeMenu();
                  }}
                  sx={{ m: 0 }}
                >
                  <ListItemIcon>
                    <Delete />
                  </ListItemIcon>
                  {t("delete")}
                </MenuItem>,
              ],
              renderBottomToolbarCustomActions: ({ table }: { table: MRT_TableInstance<BookResponse> }) => {
                const handleDeleleMultiple = () => {
                  table.getSelectedRowModel().flatRows.map((row: MRT_Row<BookResponse>) => {
                    alert("deactivating " + row.original.title);
                  });
                };

                return (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      color="error"
                      disabled={table.getSelectedRowModel().flatRows.length === 0}
                      onClick={handleDeleleMultiple}
                      variant="outlined"
                      startIcon={<Delete />}
                      sx={{ ml: 2 }}
                    >
                      {t("delete")}
                    </Button>
                  </div>
                );
              },
              muiToolbarAlertBannerProps: isError
                ? {
                    color: "error",
                    children: t("error.network"),
                  }
                : { color: "success" },
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
