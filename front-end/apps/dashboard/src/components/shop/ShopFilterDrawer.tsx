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
} from "@mui/material";
import { Check, CloseRounded, RestartAlt, FilterAlt, FilterAltOff } from "@mui/icons-material";
import { useTranslations } from "next-intl";
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

export interface ShopFilterState {
  keyword: string;
}

const DEFAULT_FILTERS: ShopFilterState = {
  keyword: "",
};

export interface ShopFilterDrawerProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: ShopFilterState;
  onApply: (filters: ShopFilterState) => void;
  onReset: () => void;
}

export default function ShopFilterDrawer({ open, onOpen, onClose, filters, onApply, onReset }: ShopFilterDrawerProps) {
  const t = useTranslations();
  const [localFilters, setLocalFilters] = useState<ShopFilterState>(filters);

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
            {t("filter")}
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
