"use client";

import { useState, useMemo, lazy, Suspense } from "react";
import { Delete, Edit, FilterAlt } from "@mui/icons-material";
import {
  useGetCouponsQuery,
  useDeleteCouponMutation,
  useDeleteCouponsMutation,
} from "@/features/coupons/couponsApiSlice";
import { MRT_ColumnDef, MRT_PaginationState, MRT_Row, MRT_SortingState, MRT_TableInstance } from "material-react-table";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import CustomReactTable from "@/components/table/CustomReactTable";
import CouponFilterDrawer, { type CouponFilterState } from "@/components/coupon/CouponFilterDrawer";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Chip from "@mui/material/Chip";

import useShop from "@/hooks/useShop";
import usePendingModal from "@/hooks/usePendingModal";
import { currencyFormat, dateFormatter, getCouponType, idFormatter } from "@ring/shared";
import { CouponType } from "@ring/shared/models/couponType";
import type { CouponDTO } from "@ring/shared/models/couponDTO";

const CouponFormDialog = lazy(() => import("@/components/dialog/CouponFormDialog.jsx"));

interface CouponRow extends CouponDTO {
  id: number;
}

const ManageCoupons = () => {
  const t = useTranslations();
  const { data: session } = useSession();
  const { shop } = useShop();
  const { id: userId, isAdmin } = session?.user ?? { id: null, isAdmin: false };
  const { withPending } = usePendingModal();
  const router = useRouter();
  const [filters, setFilters] = useState<CouponFilterState>({
    code: "",
    types: [],
    showExpired: "",
    byShop: "",
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [contextCoupon, setContextCoupon] = useState<CouponRow | null>(null);

  const { data, isLoading, isError, isFetching } = useGetCouponsQuery(
    {
      page: pagination?.pageIndex,
      size: pagination?.pageSize,
      sortBy: sorting?.[0]?.id,
      sortDir: sorting?.[0]?.desc ? "desc" : "asc",
      shopId: shop?.id ?? undefined,
      code: filters.code || undefined,
      showExpired: filters.showExpired === "all" ? true : undefined,
      byShop: filters.byShop === "ring" ? false : filters.byShop === "shop" ? true : undefined,
      types: filters.types.length ? filters.types : undefined,
      userId: isAdmin ? undefined : userId ? Number(userId) : undefined,
    },
    { skip: !userId }
  );

  const [deleteCoupon] = useDeleteCouponMutation();
  const [deleteCoupons] = useDeleteCouponsMutation();

  const handleOpenFilter = () => setFilterDrawerOpen(true);

  const handleOpenAdd = () => {
    setContextCoupon(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (coupon: CouponRow) => {
    setContextCoupon(coupon);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setContextCoupon(null);
  };

  const handleDeleteSingle = (id?: number) => {
    if (!id) return;
    if (!window.confirm(t("message.confirmDelete"))) return;
    withPending(deleteCoupon(id).unwrap());
  };

  const handleDeleteSelected = (table: MRT_TableInstance<CouponRow>) => {
    const ids = table
      .getSelectedRowModel()
      .flatRows.map((row: MRT_Row<CouponRow>) => row.original.id)
      .filter(Boolean) as number[];
    if (!ids.length) return;
    if (!window.confirm(t("message.confirmDelete"))) return;
    withPending(deleteCoupons(ids.join(",")).unwrap());
  };

  const columns = useMemo<MRT_ColumnDef<CouponRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("general.id"),
        size: 80,
        Cell: ({ renderedCellValue }) => idFormatter(Number(renderedCellValue)),
      },
      {
        accessorKey: "code",
        header: t("coupon.code"),
        size: 140,
      },
      {
        accessorKey: "type",
        header: t("coupon.type"),
        size: 120,
        Cell: ({ renderedCellValue }) => {
          const couponType = renderedCellValue as CouponType | undefined;
          if (!couponType) return renderedCellValue ?? "-";
          return t(getCouponType(couponType).label);
        },
      },
      {
        accessorKey: "discount",
        header: t("coupon.discount"),
        size: 120,
        Cell: ({ row }) => {
          const discount = row.original.discount ?? 0;
          if (discount <= 1) {
            return `${(discount * 100).toFixed(0)}%`;
          }
          return currencyFormat.format(discount);
        },
      },
      {
        accessorKey: "maxDiscount",
        header: t("coupon.maxDiscount"),
        size: 140,
        Cell: ({ renderedCellValue }) =>
          renderedCellValue != null ? currencyFormat.format(Number(renderedCellValue)) : "-",
      },
      {
        accessorKey: "usage",
        header: t("coupon.usage"),
        size: 110,
      },
      {
        accessorKey: "expDate",
        header: t("coupon.expDate"),
        size: 140,
        Cell: ({ renderedCellValue }) => (renderedCellValue ? dateFormatter(new Date(String(renderedCellValue))) : "-"),
      },
      {
        accessorKey: "shopName",
        header: t("coupon.shop"),
        size: 200,
        Cell: ({ row }) => row.original.shopName ?? shop?.name ?? "-",
      },
      {
        accessorKey: "isUsable",
        header: t("coupon.isUsable"),
        size: 120,
        Cell: ({ row }) => (
          <Chip
            size="small"
            color={row.original.isUsable ? "success" : "default"}
            label={row.original.isUsable ? t("yes") : t("no")}
          />
        ),
      },
    ],
    [t, shop?.name]
  );

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {t("coupon.management")}
          </Typography>
          <CustomBreadcrumbs items={[{ label: t("coupon.management"), href: "/coupon" }]} />
        </Box>
        <Box sx={{ my: 3, display: "flex", gap: 1 }}>
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            {t("coupon.add")}
          </Button>
          <Button variant="outlined" color="info" startIcon={<FilterAlt />} onClick={handleOpenFilter}>
            {t("general.filter")}
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
                columnPinning: { right: ["mrt-row-actions"] },
              },
              layoutMode: "semantic",
              enableRowActions: true,
              enableColumnPinning: true,
              enableColumnFilterModes: true,
              positionActionsColumn: "last",
              enableColumnResizing: true,
              displayColumnDefOptions: {
                "mrt-row-actions": { header: t("general.actions") },
              },
              renderRowActionMenuItems: ({ row, closeMenu }: { row: MRT_Row<CouponRow>; closeMenu: () => void }) => [
                <MenuItem
                  key={0}
                  onClick={() => {
                    handleOpenEdit(row.original);
                    closeMenu();
                  }}
                  sx={{ m: 0 }}
                >
                  <ListItemIcon>
                    <Edit />
                  </ListItemIcon>
                  {t("edit")}
                </MenuItem>,
                <MenuItem
                  key={1}
                  onClick={() => {
                    handleDeleteSingle(row.original.id);
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
              renderBottomToolbarCustomActions: ({ table }: { table: MRT_TableInstance<CouponRow> }) => (
                <Box display="flex">
                  <Button
                    color="error"
                    disabled={table.getSelectedRowModel().flatRows.length === 0}
                    variant="outlined"
                    startIcon={<Delete />}
                    sx={{ mx: 2 }}
                    onClick={() => handleDeleteSelected(table)}
                  >
                    {t("delete")}
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
      <CouponFilterDrawer
        open={filterDrawerOpen}
        onOpen={() => setFilterDrawerOpen(true)}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        onReset={() => {
          setFilters({ code: "", types: [], showExpired: "", byShop: "" });
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      />
      <Suspense fallback={null}>
        {formOpen && (
          <CouponFormDialog
            coupon={contextCoupon as any}
            open={formOpen}
            handleClose={handleCloseForm}
            shop={shop?.id ?? ""}
          />
        )}
      </Suspense>
    </Box>
  );
};

export default ManageCoupons;
