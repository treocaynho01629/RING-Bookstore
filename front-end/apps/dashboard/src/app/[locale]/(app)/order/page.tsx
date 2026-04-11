"use client";

import { useState, useMemo } from "react";
import { Visibility, FilterAlt } from "@mui/icons-material";
import { useGetReceiptsQuery } from "@/features/orders/ordersApiSlice";
import { MRT_ColumnDef, MRT_PaginationState, MRT_Row, MRT_SortingState, MRT_TableInstance } from "material-react-table";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import MuiLink from "@mui/material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import CustomReactTable from "@/components/table/CustomReactTable";
import OrderFilterDrawer, { type OrderFilterState } from "@/components/order/OrderFilterDrawer";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";

import type { ReceiptDTO } from "@ring/shared/models/receiptDTO";

const ManageOrders = () => {
  const t = useTranslations();
  const router = useRouter();
  const [filters, setFilters] = useState<OrderFilterState>({
    keyword: "",
    status: undefined,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const { data, isLoading, isError, isFetching } = useGetReceiptsQuery({
    page: pagination?.pageIndex,
    size: pagination?.pageSize,
    sortBy: sorting?.[0]?.id,
    sortDir: sorting?.[0]?.desc ? "desc" : "asc",
    keyword: filters.keyword,
    status: filters.status,
  });

  const handleOpenFilter = () => setFilterDrawerOpen(true);

  const columns = useMemo<MRT_ColumnDef<ReceiptDTO>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("order.id"),
        size: 80,
        Cell: ({ row }) =>
          row.original.id != null ? (
            <MuiLink
              component={Link}
              href={`/order/${row.original.id}`}
              underline="hover"
              color="primary"
              onClick={(e) => e.stopPropagation()}
            >
              {row.original.id}
            </MuiLink>
          ) : (
            "-"
          ),
      },
      {
        accessorKey: "name",
        header: t("order.customer"),
        size: 220,
      },
      {
        accessorKey: "username",
        header: t("review.user"),
        size: 160,
      },
      {
        accessorKey: "email",
        header: t("order.email"),
        size: 220,
      },
      {
        accessorKey: "phone",
        header: t("order.phone"),
        size: 140,
      },
      {
        accessorKey: "address",
        header: t("order.address"),
        size: 260,
        Cell: ({ renderedCellValue }) =>
          typeof renderedCellValue === "string" && renderedCellValue.length > 80
            ? `${renderedCellValue.slice(0, 80)}…`
            : (renderedCellValue ?? "-"),
      },
      {
        accessorKey: "date",
        header: t("order.date"),
        size: 140,
        Cell: ({ renderedCellValue }) =>
          renderedCellValue ? new Date(String(renderedCellValue)).toLocaleString() : "-",
      },
      {
        accessorKey: "total",
        header: t("order.total"),
        size: 120,
        Cell: ({ renderedCellValue }) =>
          typeof renderedCellValue === "number"
            ? renderedCellValue.toLocaleString(undefined, { style: "currency", currency: "VND" })
            : (renderedCellValue ?? "-"),
      },
      {
        accessorKey: "totalDiscount",
        header: t("order.discount"),
        size: 120,
        Cell: ({ renderedCellValue }) =>
          typeof renderedCellValue === "number"
            ? renderedCellValue.toLocaleString(undefined, { style: "currency", currency: "VND" })
            : (renderedCellValue ?? "-"),
      },
    ],
    [t]
  );

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {t("order.management")}
          </Typography>
          <CustomBreadcrumbs items={[{ label: t("order.management"), href: "/order" }]} />
        </Box>
        <Box sx={{ my: 3 }}>
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
              enableRowSelection: false,
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
              renderRowActionMenuItems: ({ row, closeMenu }: { row: MRT_Row<ReceiptDTO>; closeMenu: () => void }) => [
                <MenuItem
                  key={0}
                  onClick={() => {
                    if (row.original.id) {
                      router.push(`/order/${row.original.id}`);
                    }
                    closeMenu();
                  }}
                  sx={{ m: 0 }}
                >
                  <ListItemIcon>
                    <Visibility />
                  </ListItemIcon>
                  {t("general.view")}
                </MenuItem>,
              ],
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
      <OrderFilterDrawer
        open={filterDrawerOpen}
        onOpen={() => setFilterDrawerOpen(true)}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        onReset={() => {
          setFilters({ keyword: "", status: undefined });
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      />
    </Box>
  );
};

export default ManageOrders;
