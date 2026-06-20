"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Chip,
  Stack,
  IconButton,
  DialogActions,
  DialogContent,
  DialogTitle,
  styled,
  SwipeableDrawer,
  Autocomplete,
  Badge,
} from "@mui/material";
import { Check, CloseRounded, RestartAlt, FilterAlt } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { categoriesApiSlice } from "@/features/categories/categoriesApiSlice";
import { publishersApiSlice } from "@/features/publishers/publishersApiSlice";
import { shopsApiSlice } from "@/features/shops/shopsApiSlice";
import { bookTypeOptions } from "@ring/shared/enums/book";
import { DrawerContainer, FilterText } from "@/components/custom/Components";
import { SUGGEST_PRICES } from "@ring/shared/utils/filters";
import { isEqual } from "lodash-es";
import PriceRangeSlider from "./PriceRangeSlider";
import SimpleBar from "simplebar-react";

import type { PreviewResponse } from "@/features/shops/shopsApiSlice";

//#region styled
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
//#endregion

export interface ProductFilterState {
  keyword: string;
  cate: number | null;
  shopId: number | null;
  pubIds: number[];
  types: string[];
  value: [number, number];
  rating: number | null;
  amount: number;
}

export interface ProductFilterDrawerProps {
  open: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  filters: ProductFilterState;
  defaultFilters: ProductFilterState;
  onApply: (filters: ProductFilterState) => void;
  onReset: () => void;
}

export default function ProductFilterDrawer({
  open,
  handleOpen,
  handleClose,
  filters,
  defaultFilters,
  onApply,
  onReset,
}: ProductFilterDrawerProps) {
  const t = useTranslations();
  const [currFilters, setCurrFilters] = useState<ProductFilterState>(filters);

  useEffect(() => {
    setCurrFilters(filters);
  }, [filters, open]);

  // Shops: fetch on autocomplete open
  const [openShop, setOpenShop] = useState(false);
  const [getShops, { data: shopsData, isLoading: loadingShops }] = shopsApiSlice.useLazyGetPreviewShopsQuery();

  // Publishers: fetch on autocomplete open
  const [openPub, setOpenPub] = useState(false);
  const [getPublishers, { data: publishers, isLoading: loadingPub }] = publishersApiSlice.useLazyGetPublishersQuery();

  const pubList = publishers?.ids?.map((id) => publishers?.entities[id]).filter(Boolean) ?? [];
  const shopList: PreviewResponse[] = shopsData?.ids?.map((id) => shopsData?.entities[id]).filter(Boolean) ?? [];

  // Fetch categories data
  const [openCate, setOpenCate] = useState(false);
  const [getCategories, { data: cates, isLoading: loadingCate }] = categoriesApiSlice.useLazyGetCategoriesQuery();

  const handleApply = () => {
    onApply(currFilters);
    handleClose();
  };

  /**
   * Reset the filters
   */
  const handleReset = () => {
    handleClose();
    if (onReset) onReset();
  };

  /**
   * Toggle the type filter
   * @param {string} value
   */
  const onChangeType = (value: string) => {
    setCurrFilters((prev) => {
      const idx = prev.types.indexOf(value);
      const next = [...prev.types];
      if (idx >= 0) next.splice(idx, 1);
      else next.push(value);
      return { ...prev, types: next };
    });
  };

  /**
   * Open the category autocomplete list
   */
  const handleOpenCates = () => {
    setOpenCate(true);
    if (!cates) {
      getCategories(
        {
          include: "children",
          page: 0,
          size: 999,
        },
        true
      )
        .unwrap()
        .catch((rejected) => console.error(rejected));
    }
  };

  /**
   * Close the category autocomplete list
   */
  const handleCloseCates = () => {
    setOpenCate(false);
  };

  /**
   * Change the category filter
   * @param {number | null} newValue
   */
  const onChangeCate = (newValue: number | null) => {
    setCurrFilters((prev) => ({ ...prev, cate: newValue ?? null }));
  };

  /**
   * Open shops autocomplete (lazy fetch on first open)
   */
  const handleOpenShops = () => {
    setOpenShop(true);
    if (!shopsData) {
      getShops(undefined, true)
        .unwrap()
        .catch((err) => console.error(err));
    }
  };

  /**
   * Close shops autocomplete
   */
  const handleCloseShops = () => {
    setOpenShop(false);
  };

  /**
   * Change the shop filter
   * @param {PreviewResponse | null} newValue
   */
  const handleChangeShop = (newValue: PreviewResponse | null) => {
    setCurrFilters((prev) => ({ ...prev, shopId: newValue?.id ?? null }));
  };

  /**
   * Open publishers autocomplete (lazy fetch on first open)
   */
  const handleOpenPubs = () => {
    setOpenPub(true);
    if (!publishers) {
      getPublishers({ size: 100 }, true)
        .unwrap()
        .catch((err) => console.error(err));
    }
  };

  /**
   * Close publishers autocomplete
   */
  const handleClosePubs = () => {
    setOpenPub(false);
  };

  /**
   * Change the publisher filter
   * @param {number[]} newValue
   */
  const onChangePub = (newValue: number[]) => {
    setCurrFilters((prev) => ({ ...prev, pubIds: newValue }));
  };

  /**
   * Change the value filter
   * @param {[number, number]} newValue
   */
  const onChangeValue = (newValue: [number, number]) => {
    setCurrFilters((prev) => ({ ...prev, value: newValue }));
  };

  /**
   * Change the rating filter
   * @param {number | null} newValue
   */
  const onChangeRate = (newValue: number | null) => {
    setCurrFilters((prev) => ({
      ...prev,
      rating: prev.rating == newValue ? null : newValue,
    }));
  };

  /**
   * Change the amount filter (stock)
   * @param {number} newValue
   */
  const onChangeAmount = (newValue: number) => {
    setCurrFilters((prev) => ({
      ...prev,
      amount: prev.amount === newValue ? defaultFilters.amount : newValue,
    }));
  };

  const cateList = cates?.ids?.map((id) => cates?.entities[id]).filter(Boolean) ?? [];
  const cateListWithParent = cateList.flatMap((parent) => [
    { ...parent, children: undefined },
    ...(parent.children ?? []),
  ]);
  const selectedPublishers = pubList.filter((p) => currFilters.pubIds.some((id) => Number(id) === Number(p.id)));
  const selectedCategory = cateListWithParent.find((c) => c?.id === currFilters.cate);
  const insChanged = !isEqual(currFilters, defaultFilters);

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
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
              <Badge color="primary" variant="dot" invisible={!insChanged}>
                <RestartAlt fontSize="small" />
              </Badge>
            </IconButton>
            <IconButton size="small" onClick={handleClose}>
              <CloseRounded fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <StyledDialogContent dividers sx={{ px: 2, py: 1 }}>
          <StyledSimpleBar>
            <Stack spacing={1}>
              <Box>
                <FilterText>{t("search.keyword.label")}</FilterText>
                <TextField
                  fullWidth
                  value={currFilters.keyword}
                  onChange={(e) => setCurrFilters((p) => ({ ...p, keyword: e.target.value }))}
                  size="small"
                />
              </Box>
              <Box>
                <FilterText>{t("general.shop")}</FilterText>
                <Autocomplete
                  size="small"
                  options={shopList}
                  open={openShop}
                  loading={loadingShops}
                  onOpen={handleOpenShops}
                  onClose={handleCloseShops}
                  value={shopList.find((s) => s.id === currFilters.shopId) ?? null}
                  getOptionLabel={(opt) => (typeof opt === "object" && opt?.name ? opt.name : "")}
                  isOptionEqualToValue={(opt, val) => Number(opt?.id) === Number(val?.id)}
                  onChange={(_, newValue) => handleChangeShop(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Box>
              <Box>
                <FilterText>{t("category.label")}</FilterText>
                <Autocomplete
                  size="small"
                  options={cateListWithParent}
                  open={openCate}
                  loading={loadingCate}
                  onOpen={handleOpenCates}
                  onClose={handleCloseCates}
                  value={selectedCategory ?? null}
                  getOptionLabel={(opt) => (typeof opt === "object" && opt?.name ? opt.name : "")}
                  isOptionEqualToValue={(opt, val) => Number(opt?.id) === Number(val?.id)}
                  onChange={(e, newValue) => onChangeCate(newValue?.id ?? null)}
                  renderInput={(params) => <TextField {...params} />}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps} style={{ marginLeft: option.parentId ? 16 : 0 }}>
                        {option.name}
                      </li>
                    );
                  }}
                />
              </Box>
              <Box>
                <FilterText>{t("publisher.label")}</FilterText>
                <Autocomplete
                  multiple
                  size="small"
                  options={pubList}
                  open={openPub}
                  loading={loadingPub}
                  onOpen={handleOpenPubs}
                  onClose={handleClosePubs}
                  value={selectedPublishers}
                  getOptionLabel={(opt) => (typeof opt === "object" && opt?.name ? opt.name : "")}
                  isOptionEqualToValue={(opt, val) => Number(opt?.id) === Number(val?.id)}
                  onChange={(e, newSelected) => onChangePub(newSelected?.map((v) => Number(v?.id)) ?? [])}
                  renderInput={(params) => <TextField {...params} />}
                  disableCloseOnSelect
                />
              </Box>
              <Box>
                <FilterText>{t("product.type.label")}</FilterText>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {bookTypeOptions.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={t(opt.label)}
                      variant={currFilters.types.includes(opt.value) ? "filled" : "outlined"}
                      color={currFilters.types.includes(opt.value) ? "primary" : "default"}
                      onClick={() => onChangeType(opt.value)}
                    />
                  ))}
                </Box>
              </Box>
              <Box>
                <FilterText>{t("search.price.range") ?? "Price range"}</FilterText>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {SUGGEST_PRICES.map((option: { value: [number, number]; label: string }, index: number) => {
                      const isSelected =
                        currFilters.value[0] === option.value[0] && currFilters.value[1] === option.value[1];
                      return (
                        <Chip
                          key={`range-${index}`}
                          label={option.label}
                          variant={isSelected ? "filled" : "outlined"}
                          color={isSelected ? "primary" : "default"}
                          onClick={() => onChangeValue(option.value)}
                        />
                      );
                    })}
                    <Chip
                      label={t("reset")}
                      variant={"outlined"}
                      color={"warning"}
                      onClick={() => onChangeValue(defaultFilters.value)}
                    />
                  </Stack>
                  <PriceRangeSlider value={currFilters.value} onChange={(newValue) => onChangeValue(newValue)} />
                </Stack>
              </Box>
              <Box>
                <FilterText>{t("quantity.label")}</FilterText>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {[
                    { value: 0, label: t("all.label") },
                    { value: 1, label: t("search.sort.in-stock") },
                  ].map((opt) => {
                    const isSelected = currFilters.amount === opt.value;
                    return (
                      <Chip
                        key={`amount-${opt.value}`}
                        label={opt.label}
                        variant={isSelected ? "filled" : "outlined"}
                        color={isSelected ? "primary" : "default"}
                        onClick={() => onChangeAmount(opt.value)}
                      />
                    );
                  })}
                </Box>
              </Box>
              <Box>
                <FilterText>{t("review.label")}</FilterText>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = currFilters.rating === star;
                    return (
                      <Chip
                        key={`rating-${star}`}
                        label={`${star}+ ★`}
                        variant={isSelected ? "filled" : "outlined"}
                        color={isSelected ? "primary" : "default"}
                        onClick={() => onChangeRate(isSelected ? null : Number(star))}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Stack>
          </StyledSimpleBar>
        </StyledDialogContent>
        <DialogActions sx={{ gap: 1, px: 2.5, py: 1.5 }}>
          <Button variant="outlined" color="primary" size="large" fullWidth onClick={handleApply} startIcon={<Check />}>
            {t("apply")}
          </Button>
        </DialogActions>
      </DrawerContainer>
    </SwipeableDrawer>
  );
}
