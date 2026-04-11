"use client";

import { useState } from "react";
import { styled, Theme } from "@mui/material/styles";
import { Box, Button, Stack, Typography, Table, TableBody, TableRow, TableCell, Chip } from "@mui/material";
import { Edit, ArrowBack, Person as PersonIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { dateFormatter, idFormatter, getUserRole } from "@ring/shared";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import Link from "next/link";

import UserFormDialog from "@/components/dialog/UserFormDialog";
import type { AccountDetailDTO } from "@ring/shared/models/accountDetailDTO";

//#region styled
const DetailContainer = styled(Box)`
  height: 100%;
  padding: 10px 20px;
  border: 0.5px solid ${({ theme }) => theme.vars?.palette?.divider};
  background-color: ${({ theme }) => theme.vars?.palette?.background?.paper};

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 0 12px;
  }
`;

const SectionCard = styled(DetailContainer)`
  padding: ${({ theme }) => theme.spacing(2.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const SectionTitle = styled(Box)`
  font-size: 16px;
  font-weight: 550;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  border-bottom: 0.5px solid ${({ theme }) => theme.palette.primary.main};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const InfoLabel = styled(TableCell)`
  width: 25%;
  white-space: nowrap;
  font-weight: 500;
  color: ${({ theme }) => theme.vars?.palette?.text?.secondary ?? theme.palette.text.secondary};
  font-size: 14px;
  border: none;
  padding: 8px 0;
  vertical-align: top;
`;

const InfoValue = styled(TableCell)`
  padding: ${({ theme }) => theme.spacing(1, 0, 1, 1.25)};
  font-size: 14px;
  border: none;
  vertical-align: top;
  color: ${({
    theme,
    color,
  }: {
    theme?: Theme;
    color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  }) =>
    color
      ? (theme?.vars?.palette?.[color]?.main ?? theme?.palette?.[color]?.main)
      : (theme?.vars?.palette?.text?.primary ?? theme?.palette?.text?.primary)};
`;

const InfoTable = styled(Table)`
  width: 100%;
  margin-top: 12px;

  tbody tr {
    border-bottom: none;
  }
`;

const UserAvatar = styled("img")`
  width: 100%;
  max-width: 200px;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
`;
//#endregion

export interface DetailUserContentProps {
  account: AccountDetailDTO | null;
  id: string;
}

export default function DetailUserContent({ account, id }: DetailUserContentProps) {
  const t = useTranslations();
  const [formOpen, setFormOpen] = useState(false);

  const breadcrumbItems = [
    { label: t("user.management"), href: "/user" },
    { label: account?.username || t("user.detail"), href: `/user/${id}` },
  ];

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <CustomBreadcrumbs items={breadcrumbItems} />
        </Box>
        <Stack direction="row" spacing={2}>
          <Button component={Link} href="/user" startIcon={<ArrowBack />} variant="outlined" color="warning">
            {t("back")}
          </Button>
          <Button startIcon={<Edit />} variant="outlined" color="info" onClick={() => setFormOpen(true)}>
            {t("update")}
          </Button>
        </Stack>
      </Box>
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
        <SectionCard sx={{ flex: { md: "0 0 280px" } }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            {account?.image ? (
              <UserAvatar src={account.image} alt={account?.username} />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 200,
                  aspectRatio: 1,
                  borderRadius: "50%",
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon sx={{ fontSize: 80, color: "text.secondary" }} />
              </Box>
            )}
            <Typography variant="h6">{account?.username ?? "-"}</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center" }}>
              {(account?.roles ?? []).map((role) => {
                const meta = getUserRole(role);
                return <Chip key={role} size="small" color={meta?.color as any} label={t(meta?.label ?? role)} />;
              })}
            </Box>
          </Box>
        </SectionCard>
        <SectionCard sx={{ flex: 1 }}>
          <SectionTitle>
            <PersonIcon fontSize="small" />
            {t("user.detail")}
          </SectionTitle>
          <InfoTable>
            <TableBody>
              <TableRow>
                <InfoLabel>{t("general.id")}</InfoLabel>
                <InfoValue>{account?.id != null ? idFormatter(account.id) : "-"}</InfoValue>
              </TableRow>
              <TableRow>
                <InfoLabel>{t("user.username")}</InfoLabel>
                <InfoValue>{account?.username ?? "-"}</InfoValue>
              </TableRow>
              <TableRow>
                <InfoLabel>{t("user.name")}</InfoLabel>
                <InfoValue>{account?.name ?? "-"}</InfoValue>
              </TableRow>
              <TableRow>
                <InfoLabel>{t("user.email")}</InfoLabel>
                <InfoValue>{account?.email ?? "-"}</InfoValue>
              </TableRow>
              <TableRow>
                <InfoLabel>{t("user.phone")}</InfoLabel>
                <InfoValue>{account?.phone ?? "-"}</InfoValue>
              </TableRow>
              <TableRow>
                <InfoLabel>{t("user.gender")}</InfoLabel>
                <InfoValue>{account?.gender ? t(`gender.${account.gender.toLowerCase()}`) : "-"}</InfoValue>
              </TableRow>
              <TableRow>
                <InfoLabel>{t("user.dob")}</InfoLabel>
                <InfoValue>{account?.dob ? dateFormatter(new Date(account.dob)) : "-"}</InfoValue>
              </TableRow>
              <TableRow>
                <InfoLabel>{t("user.joinedDate")}</InfoLabel>
                <InfoValue>{account?.joinedDate ? dateFormatter(new Date(account.joinedDate)) : "-"}</InfoValue>
              </TableRow>
              <TableRow>
                <InfoLabel>{t("followers")}</InfoLabel>
                <InfoValue>{account?.totalFollows ?? 0}</InfoValue>
              </TableRow>
              <TableRow>
                <InfoLabel>{t("review.label")}</InfoLabel>
                <InfoValue>{account?.totalReviews ?? 0}</InfoValue>
              </TableRow>
            </TableBody>
          </InfoTable>
        </SectionCard>
      </Box>
      {formOpen && account && (
        <UserFormDialog
          user={account}
          open={formOpen}
          handleClose={() => setFormOpen(false)}
        />
      )}
    </Box>
  );
}
