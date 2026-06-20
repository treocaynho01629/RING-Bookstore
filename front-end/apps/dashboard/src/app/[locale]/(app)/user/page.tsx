"use client";

import { useState, useMemo, lazy, Suspense } from "react";
import { Delete, Edit, FilterAlt, Visibility } from "@mui/icons-material";
import { useGetUsersQuery, useDeleteUserMutation, useDeleteUsersMutation } from "@/features/users/usersApiSlice";
import { MRT_ColumnDef, MRT_PaginationState, MRT_Row, MRT_SortingState, MRT_TableInstance } from "material-react-table";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import CustomReactTable from "@/components/table/CustomReactTable";
import UserFilterDrawer, { type UserFilterState } from "@/components/user/UserFilterDrawer";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Chip from "@mui/material/Chip";
import MuiLink from "@mui/material/Link";

import { idFormatter, getUserRole } from "@ring/shared";
import usePendingModal from "@/hooks/usePendingModal";
import type { AccountDTO } from "@ring/shared/models/accountDTO";

const UserFormDialog = lazy(() => import("@/components/dialog/UserFormDialog.jsx"));

interface UserRow extends AccountDTO {
  id: number;
}

const ManageUsers = () => {
  const t = useTranslations();
  const router = useRouter();
  const { data: session } = useSession();
  const { isAdmin } = session?.user ?? { isAdmin: false };
  const { withPending } = usePendingModal();
  const [filters, setFilters] = useState<UserFilterState>({
    keyword: "",
    role: "",
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [contextUser, setContextUser] = useState<UserRow | null>(null);

  const { data, isLoading, isError, isFetching } = useGetUsersQuery(
    {
      page: pagination?.pageIndex,
      size: pagination?.pageSize,
      sortBy: sorting?.[0]?.id,
      sortDir: sorting?.[0]?.desc ? "desc" : "asc",
      keyword: filters.keyword || undefined,
      role: filters.role || undefined,
    },
    { skip: !isAdmin }
  );

  const [deleteUser] = useDeleteUserMutation();
  const [deleteUsers] = useDeleteUsersMutation();

  const handleOpenFilter = () => setFilterDrawerOpen(true);

  const handleOpenAdd = () => {
    setContextUser(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (user: UserRow) => {
    setContextUser(user);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setContextUser(null);
  };

  const handleDeleteSingle = (id?: number) => {
    if (!id) return;
    if (!window.confirm(t("message.confirmDelete"))) return;
    withPending(deleteUser(id).unwrap());
  };

  const handleDeleteSelected = (table: MRT_TableInstance<UserRow>) => {
    const ids = table
      .getSelectedRowModel()
      .flatRows.map((row: MRT_Row<UserRow>) => row.original.id)
      .filter(Boolean) as number[];
    if (!ids.length) return;
    if (!window.confirm(t("message.confirmDelete"))) return;
    withPending(deleteUsers(ids.join(",")).unwrap());
  };

  const columns = useMemo<MRT_ColumnDef<UserRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("general.id"),
        size: 80,
        Cell: ({ renderedCellValue, row }) => (
          <MuiLink
            component={Link}
            href={{
              pathname: "/user/[id]",
              params: { id: row.original.id },
            }}
            underline="hover"
          >
            {idFormatter(Number(renderedCellValue))}
          </MuiLink>
        ),
      },
      {
        accessorKey: "username",
        header: t("user.username"),
        size: 140,
      },
      {
        accessorKey: "name",
        header: t("user.name"),
        size: 180,
        Cell: ({ renderedCellValue }) => renderedCellValue ?? "-",
      },
      {
        accessorKey: "email",
        header: t("user.email"),
        size: 200,
        Cell: ({ renderedCellValue }) => renderedCellValue ?? "-",
      },
      {
        accessorKey: "phone",
        header: t("user.phone"),
        size: 140,
        Cell: ({ renderedCellValue }) => renderedCellValue ?? "-",
      },
      {
        accessorKey: "roles",
        header: t("user.roles"),
        size: 180,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {(row.original.roles ?? []).map((role) => {
              const meta = getUserRole(role);
              return <Chip key={role} size="small" color={meta?.color as any} label={t(meta?.label ?? role)} />;
            })}
            {(!row.original.roles || row.original.roles.length === 0) && "-"}
          </Box>
        ),
      },
    ],
    [t]
  );

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {t("user.management")}
          </Typography>
          <CustomBreadcrumbs items={[{ label: t("user.management"), href: "/user" }]} />
        </Box>
        <Box sx={{ my: 3, display: "flex", gap: 1 }}>
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            {t("user.add")}
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
              renderRowActionMenuItems: ({ row, closeMenu }: { row: MRT_Row<UserRow>; closeMenu: () => void }) => [
                <MenuItem
                  key={0}
                  onClick={() => {
                    router.push({
                      pathname: "/user/[id]",
                      params: { id: row.original.id },
                    });
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
                  key={2}
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
              renderBottomToolbarCustomActions: ({ table }: { table: MRT_TableInstance<UserRow> }) => (
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
      <UserFilterDrawer
        open={filterDrawerOpen}
        onOpen={() => setFilterDrawerOpen(true)}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        onReset={() => {
          setFilters({ keyword: "", role: "" });
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      />
      <Suspense fallback={null}>
        {formOpen && <UserFormDialog user={contextUser} open={formOpen} handleClose={handleCloseForm} />}
      </Suspense>
    </Box>
  );
};

export default ManageUsers;
