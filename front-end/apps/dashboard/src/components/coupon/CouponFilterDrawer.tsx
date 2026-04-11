"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  IconButton,
  DialogActions,
  DialogContent,
  DialogTitle,
  styled,
  SwipeableDrawer,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from "@mui/material";
import { Check, CloseRounded, RestartAlt, FilterAlt, FilterAltOff } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { couponTypeOptions } from "@ring/shared";
import { DrawerContainer, FilterText } from "@/components/custom/Components";
import SimpleBar from "simplebar-react";

const StyledSimpleBar = styled(SimpleBar)`
  position: absolute !important;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: inherit;

  .simplebar-track {
    &.simplebar-vertical {
      .simplebar-scrollbar {
        &:before {
          background-color: ${({ theme }) => theme?.vars?.palette.divider};
        }
      }
    }
  }
`;

const StyledDialogContent = styled(DialogContent)`
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100dvh;
  width: 400px;
  position: relative;
`;

export interface CouponFilterState {
  code: string;
  types: string[];
  showExpired: "" | "all";
  byShop: "" | "ring" | "shop";
}

const DEFAULT_FILTERS: CouponFilterState = {
  code: "",
  types: [],
  showExpired: "",
  byShop: "",
};

export interface CouponFilterDrawerProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: CouponFilterState;
  onApply: (filters: CouponFilterState) => void;
  onReset: () => void;
}

export default function CouponFilterDrawer({
  open,
  onOpen,
  onClose,
  filters,
  onApply,
  onReset,
}: CouponFilterDrawerProps) {
  const t = useTranslations();
  const [localFilters, setLocalFilters] = useState<CouponFilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  /**
   * Apply filters and close drawer
   */
  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  /**
   * Reset filters to defaults and close drawer
   */
  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onReset();
    onClose();
  };

  /**
   * Toggle coupon type selection
   */
  const handleTypeToggle = (value: string) => {
    setLocalFilters((prev) => {
      const idx = prev.types.indexOf(value);
      const next = idx >= 0 ? prev.types.filter((t) => t !== value) : [...prev.types, value];
      return { ...prev, types: next };
    });
  };

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      disableBackdropTransition
      disableDiscovery
      swipeAreaWidth={8}
      disableSwipeToOpen={false}
    >
      <DrawerContainer>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={1} ml={-0.5}>
            <FilterAlt fontSize="small" />
            {t("general.filter")}
          </Box>
          <Box display="flex" alignItems="center" gap={0.5} mr={-1}>
            <IconButton size="small" onClick={handleReset}>
              <RestartAlt fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <CloseRounded fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <StyledDialogContent dividers sx={{ px: 2.5, py: 2 }}>
          <StyledSimpleBar>
            <Stack spacing={2}>
              <Box>
                <FilterText>{t("search.keyword.label")}</FilterText>
                <TextField
                  fullWidth
                  value={localFilters.code}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, code: e.target.value }))}
                  size="small"
                  placeholder={t("coupon.code")}
                />
              </Box>
              <Box>
                <FilterText>{t("coupon.status")}</FilterText>
                <ToggleButtonGroup
                  value={localFilters.showExpired}
                  exclusive
                  onChange={(_, value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      showExpired: value ?? "",
                    }))
                  }
                  size="small"
                >
                  <ToggleButton value="">{t("coupon.activeOnly")}</ToggleButton>
                  <ToggleButton value="all">{t("coupon.includeExpired")}</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box>
                <FilterText>{t("coupon.owner")}</FilterText>
                <ToggleButtonGroup
                  value={localFilters.byShop}
                  exclusive
                  onChange={(_, value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      byShop: value ?? "",
                    }))
                  }
                  size="small"
                >
                  <ToggleButton value="">{t("all.label")}</ToggleButton>
                  <ToggleButton value="ring">{t("coupon.ring")}</ToggleButton>
                  <ToggleButton value="shop">{t("general.shop")}</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box>
                <FilterText>{t("coupon.type")}</FilterText>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {couponTypeOptions.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={t(opt.label)}
                      size="small"
                      variant={localFilters.types.includes(opt.value) ? "filled" : "outlined"}
                      color={localFilters.types.includes(opt.value) ? "primary" : "default"}
                      onClick={() => handleTypeToggle(opt.value)}
                    />
                  ))}
                </Box>
              </Box>
            </Stack>
          </StyledSimpleBar>
        </StyledDialogContent>
        <DialogActions sx={{ gap: 1, px: 2.5, py: 1.5 }}>
          <Button variant="outlined" color="error" size="large" onClick={handleReset} startIcon={<FilterAltOff />}>
            {t("search.filter.clear")}
          </Button>
          <Button variant="contained" color="primary" size="large" onClick={handleApply} startIcon={<Check />}>
            {t("apply")}
          </Button>
        </DialogActions>
      </DrawerContainer>
    </SwipeableDrawer>
  );
}
