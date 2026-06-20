"use client";

import { useState } from "react";
import { styled, Theme } from "@mui/material/styles";
import { Box, Button, Stack, Typography, IconButton, Table, TableBody, TableRow, TableCell } from "@mui/material";
import { Edit, ArrowBack, Info as InfoIcon, Store as StoreIcon, LocationOn as AddressIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { dateFormatter, idFormatter, numFormat } from "@ring/shared";
import { capitalize } from "lodash";
import Grid from "@mui/material/Grid";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import Link from "next/link";

import ShopFormDialog from "@/components/dialog/ShopFormDialog";
import type { ShopDetailDTO } from "@ring/shared/models/shopDetailDTO";

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

const ShopImage = styled("img")`
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
//#endregion

export interface DetailShopContentProps {
  shop: ShopDetailDTO | null;
  id: string;
}

export default function DetailShopContent({ shop, id }: DetailShopContentProps) {
  const t = useTranslations();
  const [formOpen, setFormOpen] = useState(false);

  const handleEditSection = (_section: string) => {
    setFormOpen(true);
  };

  const breadcrumbItems = [
    { label: capitalize(t("management.title", { label: t("shop.label") })), href: "/shop" },
    { label: shop?.name || capitalize(t("shop.detail")), href: `/shop/${id}` },
  ];

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <CustomBreadcrumbs items={breadcrumbItems} />
        </Box>
        <Stack direction="row" spacing={2}>
          <Button component={Link} href="/shop" startIcon={<ArrowBack />} variant="outlined" color="warning">
            {t("back")}
          </Button>
          <Button startIcon={<Edit />} variant="outlined" color="info" onClick={() => handleEditSection("basic")}>
            {t("update")}
          </Button>
        </Stack>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              {shop?.image ? (
                <ShopImage src={shop.image} alt={shop?.name} />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 280,
                    aspectRatio: 1,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <StoreIcon sx={{ fontSize: 80, color: "text.disabled" }} />
                </Box>
              )}
              <Button variant="outlined" size="small" startIcon={<Edit />} onClick={() => handleEditSection("images")}>
                {t("shop.editImage")}
              </Button>
            </Box>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard>
            <SectionTitle>
              <InfoIcon fontSize="small" />
              {t("basic")}
              <IconButton size="small" onClick={() => handleEditSection("basic")} sx={{ ml: "auto" }}>
                <Edit fontSize="small" />
              </IconButton>
            </SectionTitle>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {shop?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {shop?.username ? `${t("shop.owner")}: ${shop.username}` : ""}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {shop?.description || "-"}
            </Typography>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard>
            <SectionTitle>
              <AddressIcon fontSize="small" />
              {t("address")}
              <IconButton size="small" onClick={() => handleEditSection("address")} sx={{ ml: "auto" }}>
                <Edit fontSize="small" />
              </IconButton>
            </SectionTitle>
            <InfoTable>
              <TableBody>
                <TableRow>
                  <InfoLabel>{t("shop.form.recipientName")}</InfoLabel>
                  <InfoValue>{shop?.address?.name || "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("shop.form.phone")}</InfoLabel>
                  <InfoValue>{shop?.address?.phone || "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("shop.form.city")}</InfoLabel>
                  <InfoValue>{"-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("shop.form.address")}</InfoLabel>
                  <InfoValue>{shop?.address?.address || "-"}</InfoValue>
                </TableRow>
              </TableBody>
            </InfoTable>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard>
            <SectionTitle>
              <StoreIcon fontSize="small" />
              {t("shop.details")}
            </SectionTitle>
            <InfoTable>
              <TableBody>
                <TableRow>
                  <InfoLabel>{t("general.id")}</InfoLabel>
                  <InfoValue>{idFormatter(Number(shop?.id))}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("joined.date")}</InfoLabel>
                  <InfoValue>{shop?.joinedDate ? dateFormatter(new Date(shop.joinedDate)) : "-"}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("shop.totalProducts")}</InfoLabel>
                  <InfoValue>{numFormat.format(shop?.totalProducts ?? 0)}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("shop.totalSold")}</InfoLabel>
                  <InfoValue>{numFormat.format(shop?.totalSold ?? 0)}</InfoValue>
                </TableRow>
                <TableRow>
                  <InfoLabel>{t("shop.totalFollowers")}</InfoLabel>
                  <InfoValue>{numFormat.format(shop?.totalFollowers ?? 0)}</InfoValue>
                </TableRow>
              </TableBody>
            </InfoTable>
          </SectionCard>
        </Grid>
      </Grid>
      {shop && <ShopFormDialog shop={shop} open={formOpen} handleClose={() => setFormOpen(false)} />}
    </Box>
  );
}
