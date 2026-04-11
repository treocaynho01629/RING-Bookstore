"use client";

import { useState, Suspense, lazy, useMemo } from "react";
import { Delete, Edit, FilterAlt, Star } from "@mui/icons-material";
import { Visibility } from "@mui/icons-material";
import { useGetReviewsQuery, useDeleteReviewMutation, useDeleteReviewsMutation } from "@/features/reviews/reviewsApiSlice";
import { MRT_ColumnDef, MRT_PaginationState, MRT_Row, MRT_SortingState, MRT_TableInstance } from "material-react-table";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import CustomReactTable from "@/components/table/CustomReactTable";
import ReviewFilterDrawer from "@/components/review/ReviewFilterDrawer";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import usePendingModal from "@/hooks/usePendingModal";

import type { ReviewDTO } from "@ring/shared/models/reviewDTO";

const ManageReviews = () => {
  const t = useTranslations();
  const { data: session } = useSession();
  const { id, isAdmin } = session?.user ?? { id: null, isAdmin: false };
  const { withPending } = usePendingModal();
  const router = useRouter();
  const [filters, setFilters] = useState<{
    keyword: string;
    rating?: number;
  }>({
    keyword: "",
    rating: undefined,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const { data, isLoading, isError, isFetching } = useGetReviewsQuery(
    {
      page: pagination?.pageIndex,
      size: pagination?.pageSize,
      sortBy: sorting?.[0]?.id,
      sortDir: sorting?.[0]?.desc ? "desc" : "asc",
      keyword: filters.keyword,
      rating: filters.rating,
      userId: isAdmin ? undefined : id ? Number(id) : undefined,
    },
    { skip: !id }
  );
  const [deleteReview] = useDeleteReviewMutation();
  const [deleteReviews] = useDeleteReviewsMutation();

  const handleOpenFilter = () => setFilterDrawerOpen(true);

  const columns = useMemo<MRT_ColumnDef<ReviewDTO>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("general.id"),
        size: 80,
      },
      {
        accessorKey: "bookTitle",
        header: t("review.book"),
        size: 260,
        Cell: ({ row }) =>
          row.original?.bookId ? (
            <Link href={`/product/${row.original.bookId}`}>{row.original.bookTitle}</Link>
          ) : (
            row.original.bookTitle ?? "-"
          ),
      },
      {
        accessorKey: "username",
        header: t("review.user"),
        size: 160,
      },
      {
        accessorKey: "rating",
        header: t("review.rating"),
        size: 110,
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ renderedCellValue }) => (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
            <span>{Number(renderedCellValue ?? 0).toFixed(1)}</span>
            <Star color="warning" sx={{ fontSize: 16 }} />
          </Box>
        ),
      },
      {
        accessorKey: "date",
        header: t("review.date"),
        size: 140,
        Cell: ({ renderedCellValue }) =>
          renderedCellValue ? new Date(String(renderedCellValue)).toLocaleDateString() : "-",
      },
      {
        accessorKey: "content",
        header: t("review.content"),
        size: 380,
        Cell: ({ renderedCellValue }) =>
          typeof renderedCellValue === "string" && renderedCellValue.length > 120
            ? `${renderedCellValue.slice(0, 120)}…`
            : renderedCellValue ?? "-",
      },
    ],
    [t]
  );

  const handleDeleteSingle = (id?: number) => {
    if (!id) return;
    if (!window.confirm(t("message.confirmDelete"))) return;
    withPending(deleteReview(id).unwrap());
  };

  const handleDeleteSelected = (table: MRT_TableInstance<ReviewDTO>) => {
    const ids = table
      .getSelectedRowModel()
      .flatRows.map((row: MRT_Row<ReviewDTO>) => row.original.id)
      .filter(Boolean) as number[];
    if (!ids.length) return;
    if (!window.confirm(t("message.confirmDelete"))) return;
    withPending(deleteReviews(ids.join(",")).unwrap());
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {t("review.management")}
          </Typography>
          <CustomBreadcrumbs items={[{ label: t("review.management"), href: "/review" }]} />
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
              renderRowActionMenuItems: ({ row, closeMenu }: { row: MRT_Row<ReviewDTO>; closeMenu: () => void }) => [
                <MenuItem
                  key={0}
                  onClick={() => {
                    if (row.original.bookId) {
                      router.push(`/product/${row.original.bookId}`);
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
              renderBottomToolbarCustomActions: ({ table }: { table: MRT_TableInstance<ReviewDTO> }) => (
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
      <ReviewFilterDrawer
        open={filterDrawerOpen}
        onOpen={() => setFilterDrawerOpen(true)}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        onReset={() => {
          setFilters({ keyword: "", rating: undefined });
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      />
    </Box>
  );
};

export default ManageReviews;

