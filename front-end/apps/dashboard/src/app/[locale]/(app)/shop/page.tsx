"use client";

import { useState, Suspense, lazy, useMemo, useEffect } from "react";
import { Add, CheckCircle, Close, Delete, Edit, FilterAlt, Store, Visibility } from "@mui/icons-material";
import { useGetShopsQuery, useLazyGetShopQuery } from "@/features/shops/shopsApiSlice";
import { MRT_ColumnDef, MRT_PaginationState, MRT_Row, MRT_SortingState, MRT_TableInstance } from "material-react-table";
import { useSession } from "next-auth/react";
import { currencyFormat, idFormatter, numFormat } from "@ring/shared";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { capitalize } from "lodash-es";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import CustomReactTable from "@/components/table/CustomReactTable";
import ShopFilterDrawer from "@/components/shop/ShopFilterDrawer";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";

import type { ShopDetailDTO } from "@ring/shared/models/shopDetailDTO";
import type { ShopResponse } from "@/features/shops/shopsApiSlice";

const ShopFormDialog = lazy(() => import("@/components/dialog/ShopFormDialog"));

const ManageShops = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { id, isAdmin } = session?.user ?? { id: null, isAdmin: false };
  const [contextShop, setContextShop] = useState<ShopDetailDTO | null>(null);
  const [open, setOpen] = useState<boolean | undefined>(undefined);

  /** Open add dialog when searchParams has add=true */
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setContextShop(null);
      setOpen(true);
    }
  }, [searchParams]);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [getShop] = useLazyGetShopQuery();
  const [filters, setFilters] = useState<{
    keyword: string;
    userId?: number;
  }>({
    keyword: "",
    userId: undefined,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const { data, isLoading, isError, isFetching } = useGetShopsQuery(
    {
      page: pagination?.pageIndex,
      size: pagination?.pageSize,
      sortBy: sorting?.[0]?.id,
      sortDir: sorting?.[0]?.desc ? "desc" : "asc",
      keyword: filters.keyword,
      userId: isAdmin ? filters.userId : id ? Number(id) : undefined,
    },
    { skip: !id }
  );

  const handleOpenFilter = () => setFilterDrawerOpen(true);

  const handleOpen = () => {
    setContextShop(null);
    setOpen(true);
  };

  /**
   * Close dialog and remove add param from URL
   */
  const handleClose = () => {
    setOpen(false);
    if (searchParams.get("add") === "true") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("add");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }
  };

  const columns = useMemo<MRT_ColumnDef<ShopResponse>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("id"),
        size: 80,
        Cell: ({ renderedCellValue }) => (
          <Link href={`/shop/${renderedCellValue}`}>{idFormatter(Number(renderedCellValue))}</Link>
        ),
      },
      {
        accessorKey: "name",
        header: t("name"),
        size: 300,
        Cell: ({ renderedCellValue, row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Avatar src={row.original.image} sx={{ width: 36, height: 36 }}>
              <Store fontSize="small" color="action" />
            </Avatar>
            <Stack>
              <span>{renderedCellValue}</span>
              <Typography variant="caption" color={row.original.verified ? "success" : "  "}>
                {row.original.verified ? t("shop.verified") : t("shop.unverified")}
              </Typography>
            </Stack>
          </Box>
        ),
      },
      {
        accessorKey: "username",
        header: t("shop.owner"),
        size: 150,
        visibleInShowHideMenu: isAdmin,
        Cell: ({ renderedCellValue, row }) => <Link href={`/user/${row.original.ownerId}`}>{renderedCellValue}</Link>,
      },
      {
        accessorKey: "totalFollowers",
        header: t("follower"),
        filterVariant: "range",
        size: 120,
        Cell: ({ renderedCellValue }) => numFormat.format(Number(renderedCellValue ?? 0)),
      },
      {
        accessorKey: "totalReviews",
        header: t("review.label"),
        filterVariant: "range",
        size: 120,
        Cell: ({ renderedCellValue }) => numFormat.format(Number(renderedCellValue ?? 0)),
      },
      {
        accessorKey: "totalProducts",
        header: t("product.label"),
        filterVariant: "range",
        size: 120,
        Cell: ({ renderedCellValue }) => numFormat.format(Number(renderedCellValue ?? 0)),
      },
      {
        accessorKey: "totalOrders",
        header: t("order.label"),
        filterVariant: "range",
        size: 120,
        Cell: ({ renderedCellValue }) => numFormat.format(Number(renderedCellValue ?? 0)),
      },
      {
        accessorKey: "sales",
        header: t("sales"),
        filterVariant: "range",
        size: 120,
        Cell: ({ renderedCellValue }) => currencyFormat.format(Number(renderedCellValue ?? 0)),
      },
      {
        accessorKey: "canceledRate",
        header: t("shop.rate"),
        filterVariant: "range",
        size: 120,
        Cell: ({ renderedCellValue }) => `${(((renderedCellValue ?? 0) as number) * 100).toFixed(1)}%`,
      },
      {
        accessorKey: "joinedDate",
        header: t("joined.date"),
        size: 140,
        Cell: ({ renderedCellValue }) =>
          renderedCellValue ? new Date(String(renderedCellValue)).toLocaleDateString() : "-",
      },
    ],
    [t]
  );

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {capitalize(t("management.title", { label: t("shop.label") }))}
          </Typography>
          <CustomBreadcrumbs
            items={[{ label: capitalize(t("management.title", { label: t("shop.label") })), href: "/shop" }]}
          />
        </Box>
        <Box sx={{ my: 3 }}>
          <Button variant="outlined" color="info" startIcon={<FilterAlt />} onClick={handleOpenFilter}>
            {t("filter")}
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
                showProgressBars: isFetching,
                showAlertBanner: isError,
                showProgressBars: isLoading,
              },
              enableStickyHeader: true,
              initialState: {
                density: "compact",
                columnPinning: { right: ["mrt-row-actions"] },
                columnVisibility: { username: isAdmin, totalFollowers: false, totalOrders: false, joinedDate: false },
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
              renderRowActionMenuItems: ({ row, closeMenu }: { row: MRT_Row<ShopResponse>; closeMenu: () => void }) => [
                <MenuItem
                  key={0}
                  onClick={() => {
                    router.push(`/shop/${row.original.id}`);
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
                    getShop(row.original.id, true)
                      .unwrap()
                      .then((shop: ShopDetailDTO) => {
                        setContextShop(shop);
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
              renderBottomToolbarCustomActions: ({ table }: { table: MRT_TableInstance<ShopResponse> }) => (
                <Box display="flex">
                  <Button
                    color="error"
                    disabled={table.getSelectedRowModel().flatRows.length === 0}
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
              ),
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
      <ShopFilterDrawer
        open={filterDrawerOpen}
        onOpen={() => setFilterDrawerOpen(true)}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApply={(f) => {
          setFilters((prev) => ({ ...prev, ...f }));
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        onReset={() => {
          setFilters({ keyword: "", userId: undefined });
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      />
      <Suspense fallback={null}>
        {open !== undefined && <ShopFormDialog open={open} handleClose={handleClose} shop={contextShop} />}
      </Suspense>
    </Box>
  );
};

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ManageShops />
    </Suspense>
  );
}
