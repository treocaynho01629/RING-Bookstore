"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { Save } from "@mui/icons-material";

import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import { userRoleOptions } from "@ring/shared/enums/user";
import { useGetPrivilegesQuery, useGetRoleQuery, useUpdateRoleMutation } from "@/features/roles/rolesApiSlice";
import usePendingModal from "@/hooks/usePendingModal";

const ManageAuthorities = () => {
  const t = useTranslations();

  const [selectedRole, setSelectedRole] = useState(userRoleOptions[0]?.value ?? "");
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);
  const { open: pending, showPending, hidePending } = usePendingModal();

  const { data: role, isLoading: loadingRole } = useGetRoleQuery(selectedRole, {
    skip: !selectedRole,
  });
  const { data: privileges, isLoading: loadingPrivileges } = useGetPrivilegesQuery({});
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();

  useEffect(() => {
    if (role && !loadingRole) {
      const newSelected = role?.privileges?.map((privilege: any) => privilege.privilegeType) ?? [];
      setSelectedPrivileges(newSelected);
    }
  }, [role, loadingRole]);

  const handleChangePrivileges = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedPrivileges((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (updating || pending || !selectedRole) return;

    showPending();
    const { enqueueSnackbar } = await import("notistack");

    updateRole({ name: selectedRole, privileges: selectedPrivileges })
      .unwrap()
      .then(() => {
        enqueueSnackbar(t("message.success.update"), { variant: "success" });
        hidePending();
      })
      .catch((error) => {
        console.error(error);
        enqueueSnackbar(t("message.error.update"), { variant: "error" });
        hidePending();
      });
  };

  const privilegeGroups = useMemo(() => {
    if (!privileges || loadingPrivileges) return [];
    const { ids = [], entities = {} } = privileges as any;
    return ids.map((id: string | number) => entities[id]).filter(Boolean);
  }, [privileges, loadingPrivileges]);

  const isSaving = pending || updating;

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {t("user.privilege")}
          </Typography>
          <CustomBreadcrumbs items={[{ label: t("user.privilege"), href: "/auth" }]} />
        </Box>
        <Button
          type="submit"
          form="manage-authorities-form"
          variant="contained"
          color="primary"
          startIcon={isSaving ? <CircularProgress size={18} /> : <Save />}
          disabled={isSaving || !selectedRole}
        >
          {t("update")}
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.vars?.palette?.divider ?? theme.palette.divider}`,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <Box flex={1}>
            <TextField
              label={t("user.role")}
              id="role"
              select
              fullWidth
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              size="small"
            >
              {userRoleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t("dashboard.management")}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Box
          component="form"
          id="manage-authorities-form"
          onSubmit={handleSubmit}
          sx={{ flex: 1, overflowY: "auto" }}
        >
          {loadingPrivileges || loadingRole ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={160}>
              <CircularProgress size={28} />
            </Box>
          ) : privilegeGroups.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("misc")}
            </Typography>
          ) : (
            <Stack spacing={2}>
              {privilegeGroups.map((group: any, index: number) => (
                <Box
                  key={`group-${group?.id ?? index}`}
                  sx={{
                    borderRadius: 1.5,
                    border: (theme) => `1px solid ${theme.vars?.palette?.divider ?? theme.palette.divider}`,
                    p: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {group?.groupName}
                  </Typography>
                  <FormGroup sx={{ m: 0 }}>
                    {group?.groupPrivileges?.map((privilege: any, pIndex: number) => {
                      const privilegeValue = privilege?.privilegeType;
                      const isChecked = selectedPrivileges.includes(privilegeValue);

                      return (
                        <FormControlLabel
                          key={`privilege-${privilege?.id ?? pIndex}`}
                          control={
                            <Checkbox
                              value={privilegeValue}
                              checked={isChecked}
                              onChange={handleChangePrivileges}
                              disableRipple
                              color="primary"
                              size="small"
                            />
                          }
                          sx={{
                            width: "100%",
                            m: 0,
                            "& .MuiFormControlLabel-label": { fontSize: 14 },
                          }}
                          label={privilege?.label}
                        />
                      );
                    })}
                  </FormGroup>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ManageAuthorities;
