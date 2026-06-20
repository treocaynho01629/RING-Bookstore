"use client";

import { useState, Suspense, lazy, useMemo, useEffect } from "react";
import { Add, Delete, Edit, FilterAlt, Star } from "@mui/icons-material";
import { Visibility } from "@mui/icons-material";
import { useGetBooksQuery, useLazyGetBookQuery } from "@/features/books/booksApiSlice";
import { MRT_ColumnDef, MRT_PaginationState, MRT_Row, MRT_SortingState, MRT_TableInstance } from "material-react-table";
import { useSession } from "next-auth/react";
import { getImageSrc } from "@ring/shared/enums/image";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { currencyFormat, idFormatter } from "@ring/shared";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { isEqual, capitalize } from "lodash-es";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Link from "next/link";
import useShop from "@/hooks/useShop";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import CustomReactTable from "@/components/table/CustomReactTable";
import ProductFilterDrawer from "@/components/product/ProductFilterDrawer";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

import type { BookDTO } from "@ring/shared/models/bookDTO";
import type { BookResponse } from "@ring/redux/booksApiSlice";
import type { ProductFilterState } from "@/components/product/ProductFilterDrawer";

const ProductFormDialog = lazy(() => import("@/components/dialog/ProductFormDialog"));

export interface ProductPaginationState {
  number: number;
  size: number;
  sortBy: string;
  sortDir: string;
}

const DEFAULT_FILTERS: ProductFilterState = {
  keyword: "",
  cate: null,
  shopId: null,
  pubIds: [],
  types: [],
  value: [0, 10000000],
  rating: 0,
  amount: 0,
};

const DEFAULT_PAGINATION: ProductPaginationState = {
  number: 0,
  size: 25,
  sortBy: "id",
  sortDir: "desc",
};

const parseNumberParam = (value: string | null): number | null => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseNumberArrayParam = (value: string | null): number[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => Number(item))
    .filter((item) => !Number.isNaN(item));
};

const parseStringArrayParam = (value: string | null): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseRangeParam = (value: string | null, fallback: [number, number]): [number, number] => {
  if (!value) return fallback;
  const parts = value.split(",").map((item) => Number(item));
  if (parts.length !== 2 || parts.some((item) => Number.isNaN(item))) {
    return fallback;
  }
  return [parts[0], parts[1]];
};

const ManageProducts = () => {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { shop } = useShop();
  const { id, isAdmin } = session?.user ?? { id: null, isAdmin: false };
  const [contextProduct, setContextProduct] = useState<BookDTO | null>(null);
  const [open, setOpen] = useState<boolean | undefined>(undefined);
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const [getBook] = useLazyGetBookQuery();
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: DEFAULT_PAGINATION.number,
    pageSize: DEFAULT_PAGINATION.size,
  });
  const { data, isLoading, isError, isFetching } = useGetBooksQuery(
    {
      page: pagination?.pageIndex,
      size: pagination?.pageSize,
      sortBy: sorting?.[0]?.id != null ? String(sorting[0].id) : undefined,
      sortDir: sorting?.[0]?.desc ? "desc" : "asc",
      shopId: filters.shopId ?? undefined,
      userId: isAdmin ? undefined : id ? Number(id) : undefined,
      keyword: filters.keyword,
      cateId: filters.cate ? Number(filters.cate) : undefined,
      types: filters.types,
      pubIds: filters.pubIds,
      rating: filters.rating != null ? String(filters.rating) : undefined,
      value: filters.value,
      amount: filters.amount,
    },
    { skip: !id }
  );
  const router = useRouter();

  useEffect(() => {
    const parsedFilters: ProductFilterState = {
      keyword: searchParams.get("q") ?? DEFAULT_FILTERS.keyword,
      cate: parseNumberParam(searchParams.get("cate")),
      shopId: parseNumberParam(searchParams.get("shopId")),
      pubIds: parseNumberArrayParam(searchParams.get("pubs")),
      types: parseStringArrayParam(searchParams.get("types")),
      value: parseRangeParam(searchParams.get("value"), DEFAULT_FILTERS.value),
      rating: parseNumberParam(searchParams.get("rating")) ?? DEFAULT_FILTERS.rating,
      amount: parseNumberParam(searchParams.get("amount")) ?? DEFAULT_FILTERS.amount,
    };

    const parsedPagination: MRT_PaginationState = {
      pageIndex: parseNumberParam(searchParams.get("pNo")) ?? DEFAULT_PAGINATION.number,
      pageSize: parseNumberParam(searchParams.get("pSize")) ?? DEFAULT_PAGINATION.size,
    };

    const parsedSortBy = searchParams.get("sort");
    const parsedSortDir = searchParams.get("dir");
    const parsedSorting: MRT_SortingState =
      parsedSortBy && parsedSortBy !== DEFAULT_PAGINATION.sortBy
        ? [{ id: parsedSortBy, desc: parsedSortDir === "desc" }]
        : [];

    setFilters((prev) => (isEqual(prev, parsedFilters) ? prev : parsedFilters));
    setPagination((prev) =>
      prev.pageIndex === parsedPagination.pageIndex && prev.pageSize === parsedPagination.pageSize
        ? prev
        : parsedPagination
    );
    setSorting((prev) => (isEqual(prev, parsedSorting) ? prev : parsedSorting));
  }, [searchParams]);

  /**
   * Handle apply filters
   * @param {ProductFilterState} newFilters
   */
  const handleApplyFilters = (newFilters: ProductFilterState) => {
    const params = new URLSearchParams(searchParams);
    setFilters(newFilters);
    newFilters.cate == DEFAULT_FILTERS.cate ? params.delete("cate") : params.set("cate", String(newFilters.cate));
    newFilters.keyword == DEFAULT_FILTERS.keyword ? params.delete("q") : params.set("q", newFilters.keyword);
    newFilters.shopId == DEFAULT_FILTERS.shopId
      ? params.delete("shopId")
      : params.set("shopId", String(newFilters.shopId));
    isEqual(newFilters.pubIds, DEFAULT_FILTERS.pubIds)
      ? params.delete("pubs")
      : params.set("pubs", newFilters.pubIds.join(","));
    isEqual(newFilters.types, DEFAULT_FILTERS.types)
      ? params.delete("types")
      : params.set("types", newFilters.types.join(","));
    isEqual(newFilters.value, DEFAULT_FILTERS.value)
      ? params.delete("value")
      : params.set("value", String(newFilters?.value));
    newFilters.rating == DEFAULT_FILTERS.rating
      ? params.delete("rating")
      : params.set("rating", String(newFilters.rating));
    newFilters.amount == DEFAULT_FILTERS.amount
      ? params.delete("amount")
      : params.set("amount", String(newFilters.amount));
    params.delete("pNo");
    const queryString = params.toString();
    const updatedPath = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(updatedPath);
    handleResetPage();
  };

  /**
   * Sync pagination & sorting to URL params
   */
  const syncPaginationAndSorting = (nextPagination: MRT_PaginationState, nextSorting: MRT_SortingState) => {
    const params = new URLSearchParams(searchParams);

    // Page index & size
    nextPagination.pageIndex === DEFAULT_PAGINATION.number
      ? params.delete("pNo")
      : params.set("pNo", String(nextPagination.pageIndex));
    nextPagination.pageSize === DEFAULT_PAGINATION.size
      ? params.delete("pSize")
      : params.set("pSize", String(nextPagination.pageSize));

    // Sorting
    const sortBy = nextSorting?.[0]?.id != null ? String(nextSorting[0].id) : undefined;
    const sortDir = nextSorting?.[0]?.desc ? "desc" : "asc";

    if (!sortBy || sortBy === DEFAULT_PAGINATION.sortBy) {
      params.delete("sort");
    } else {
      params.set("sort", sortBy);
    }

    if (!sortBy || sortDir === DEFAULT_PAGINATION.sortDir) {
      params.delete("dir");
    } else {
      params.set("dir", sortDir);
    }

    const queryString = params.toString();
    const updatedPath = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(updatedPath);
  };

  /**
   * Handle pagination change from table
   */
  const handlePaginationChange = (
    updater: MRT_PaginationState | ((prev: MRT_PaginationState) => MRT_PaginationState)
  ) => {
    setPagination((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      syncPaginationAndSorting(next, sorting);
      return next;
    });
  };

  /**
   * Handle sorting change from table
   */
  const handleSortingChange = (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => {
    setSorting((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      syncPaginationAndSorting(pagination, next);
      return next;
    });
  };

  /**
   * Handle reset filters
   */
  const handleResetFilters = () => {
    router.push(pathname);
    setFilters(DEFAULT_FILTERS);
    handleResetPage();
  };

  /**
   * Handle reset page
   */
  const handleResetPage = () => {
    setPagination((p) => ({ ...p, pageIndex: DEFAULT_PAGINATION.number }));
  };

  /**
   * Open filter drawer
   */
  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  /**
   * Close filter drawer
   */
  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  /**
   * Open context menu
   */
  const handleOpen = () => {
    setContextProduct(null);
    setOpen(true);
  };

  /**
   * Close context menu
   */
  const handleClose = () => {
    setOpen(false);
  };

  const columns = useMemo<MRT_ColumnDef<BookResponse>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("id"),
        size: 80,
        Cell: ({ renderedCellValue }) => (
          <Link href={`/product/${renderedCellValue}`}>{idFormatter(Number(renderedCellValue))}</Link>
        ),
      },
      {
        accessorKey: "title",
        header: t("title"),
        size: 400,
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              overflow: "hidden",
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
        header: t("product.price.original"),
        filterVariant: "range",
        size: 125,
        muiTableBodyCellProps: {
          align: "left",
        },
        Cell: ({ renderedCellValue }) => currencyFormat.format(Number(renderedCellValue)),
      },
      {
        accessorKey: "discount",
        header: t("product.price.discount"),
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
        header: t("general.shop"),
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
        header: t("order.label"),
        filterVariant: "range",
        size: 125,
        muiTableBodyCellProps: {
          align: "left",
        },
      },
    ],
    []
  );
  const isChanged = !isEqual(filters, DEFAULT_FILTERS);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {capitalize(t("management.title", { label: t("product.label") }))}
          </Typography>
          <CustomBreadcrumbs
            items={[{ label: capitalize(t("management.title", { label: t("product.label") })), href: "/product" }]}
          />
        </Box>
        <Box sx={{ my: 3 }}>
          <Badge color="primary" variant="dot" invisible={!isChanged}>
            <Button variant="outlined" color="info" startIcon={<FilterAlt />} onClick={handleOpenFilter}>
              {t("filter")}
            </Button>
          </Badge>
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
              onPaginationChange: handlePaginationChange,
              onSortingChange: handleSortingChange,
              state: {
                pagination,
                sorting,
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
              displayColumnDefOptions: {
                "mrt-row-select": { visibleInShowHideMenu: false },
                "mrt-row-actions": { header: t("actions"), visibleInShowHideMenu: false },
              },
              renderRowActionMenuItems: ({ row, closeMenu }: { row: MRT_Row<BookResponse>; closeMenu: () => void }) => [
                <MenuItem
                  key={0}
                  onClick={() => {
                    router.push(`/product/${row.original.id}`);
                    closeMenu();
                  }}
                  sx={{ m: 0 }}
                >
                  <ListItemIcon>
                    <Visibility />
                  </ListItemIcon>
                  {t("view")}
                </MenuItem>,
                <MenuItem
                  key={1}
                  onClick={() => {
                    getBook(row.original.id, true)
                      .unwrap()
                      .then((book: BookDTO) => {
                        setContextProduct(book);
                        setOpen(true);
                      })
                      .catch(() => {});
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
                  <Box display="flex">
                    <Button
                      color="error"
                      disabled={table.getSelectedRowModel().flatRows.length === 0}
                      onClick={handleDeleleMultiple}
                      variant="outlined"
                      startIcon={<Delete />}
                      sx={{ mx: 2 }}
                    >
                      {t("delete")}
                    </Button>
                    <Button variant="outlined" startIcon={<Add />} onClick={handleOpen}>
                      {t("add")}
                    </Button>
                  </Box>
                );
              },
              muiToolbarAlertBannerProps: isError
                ? {
                    color: "error",
                    children: t("error.general"),
                  }
                : { color: "success" },
            }}
          />
        </Box>
      </Box>
      <ProductFilterDrawer
        open={openFilter}
        handleOpen={handleOpenFilter}
        handleClose={handleCloseFilter}
        filters={filters}
        defaultFilters={DEFAULT_FILTERS}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      <Suspense fallback={null}>
        {open !== undefined && (
          <ProductFormDialog
            {...{
              open,
              handleClose,
              shop: shop?.id ?? undefined,
              product: contextProduct,
            }}
          />
        )}
      </Suspense>
    </Box>
  );
};

export default function ProductPage() {
  return (
    <Suspense fallback={null}>
      <ManageProducts />
    </Suspense>
  );
}
