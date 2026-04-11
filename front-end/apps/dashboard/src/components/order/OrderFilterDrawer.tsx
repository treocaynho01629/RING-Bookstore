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
} from "@mui/material";
import { Check, CloseRounded, RestartAlt, FilterAlt, FilterAltOff } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { OrderStatus } from "@ring/shared/models/orderStatus";
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

export interface OrderFilterState {
  keyword: string;
  status?: OrderStatus;
}

const DEFAULT_FILTERS: OrderFilterState = {
  keyword: "",
  status: undefined,
};

const STATUS_OPTIONS = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PENDING,
  OrderStatus.SHIPPING,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELED,
  OrderStatus.PENDING_RETURN,
  OrderStatus.PENDING_REFUND,
  OrderStatus.REFUNDED,
] as const;

export interface OrderFilterDrawerProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: OrderFilterState;
  onApply: (filters: OrderFilterState) => void;
  onReset: () => void;
}

export default function OrderFilterDrawer({
  open,
  onOpen,
  onClose,
  filters,
  onApply,
  onReset,
}: OrderFilterDrawerProps) {
  const t = useTranslations();
  const [localFilters, setLocalFilters] = useState<OrderFilterState>(filters);

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
   * Handle order status toggle change
   */
  const handleStatusChange = (_: unknown, value: OrderStatus | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: value ?? undefined,
    }));
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
                  value={localFilters.keyword}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, keyword: e.target.value }))}
                  size="small"
                />
              </Box>
              <Box>
                <FilterText>{t("order.status")}</FilterText>
                <ToggleButtonGroup
                  value={localFilters.status ?? null}
                  exclusive
                  onChange={handleStatusChange}
                  size="small"
                  sx={{ flexWrap: "wrap", gap: 0.5 }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <ToggleButton key={status} value={status}>
                      {t(`order.statuses.${status}`)}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
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
