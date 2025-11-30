import { useState, useRef, Suspense, useEffect, memo, useCallback } from "react";
import { useParams, Navigate, NavLink, useSearchParams, useNavigate } from "react-router";
import { useGetShopQuery } from "../features/shops/shopsApiSlice";
import { booksAmount, pageSizes, sortBooksBy } from "../utils/filters";
import { useGetBooksQuery } from "../features/books/booksApiSlice";
import { debounce, isEqual } from "lodash-es";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import useMediaQuery from "@mui/material/useMediaQuery";
import Grid from "@mui/material/Grid";
import CustomBreadcrumbs from "../components/custom/CustomBreadcrumbs";
import ShopDetailComponent from "../components/shop/ShopDetailComponent";
import FilterDrawer from "../components/product/filter/FilterDrawer";
import FiltersDisplay from "../components/product/filter/FiltersDisplay";
import FilterSortList from "../components/product/filter/FilterSortList";
import FilteredProducts from "../components/product/filter/FilteredProducts";
import JumpPagination from "../components/custom/JumpPagination";
import AppPagination from "../components/custom/AppPagination";
import FilterList from "../components/product/filter/FilterList";

const DEFAULT_FILTERS = {
  keyword: "",
  cate: { id: "", slug: "" },
  types: [],
  value: [0, 10000000],
  rating: 0,
};
const DEFAULT_PAGINATION = {
  number: 0,
  size: pageSizes[1],
  sortBy: sortBooksBy[0].value,
  sortDir: "desc",
  amount: booksAmount[0].value,
};

const Pagination = memo(AppPagination);

const HeaderComponent = ({ id }) => {
  // Fetch data
  const { data, isError, error } = useGetShopQuery(id, {
    skip: !id,
  });

  return isError && error?.status === 404 ? <Navigate to="/missing" replace /> : <ShopDetailComponent shop={data} />;
};

const ShopDetail = () => {
  const { id } = useParams(); //Shop id
  const { t } = useTranslation();

  // Scroll ref
  const scrollRef = useRef(null);
  const valueRef = useRef(null);
  const typesRef = useRef(null);
  const rateRef = useRef(null);

  // Responsive stuff
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md_lg"));

  const [open, setOpen] = useState(undefined); //Filter
  const [openPagination, setOpenPagination] = useState(undefined); //Pagination
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter & pagination
  const [filters, setFilters] = useState({
    keyword: searchParams.get("q") ?? DEFAULT_FILTERS.keyword,
    cate: {
      id: searchParams.get("cate") ?? DEFAULT_FILTERS.cate.id,
    },
    value: searchParams.get("value") ? searchParams.get("value").split(",").map(Number) : DEFAULT_FILTERS.value,
    types: searchParams.get("types")?.split(",") ?? DEFAULT_FILTERS.types,
    rating: searchParams.get("rating") ?? DEFAULT_FILTERS.rating,
    shopId: id,
  });
  const [pagination, setPagination] = useState({
    number: searchParams.get("pNo") ? searchParams.get("pNo") - 1 : DEFAULT_PAGINATION.number,
    size: searchParams.get("pSize") ?? DEFAULT_PAGINATION.size,
    sortBy: searchParams.get("sort") ?? DEFAULT_PAGINATION.sortBy,
    sortDir: searchParams.get("dir") ?? DEFAULT_PAGINATION.sortDir,
    amount: searchParams.get("amount") ?? DEFAULT_PAGINATION.amount,
  });

  // Fetch data
  const { data, isLoading, isFetching, isUninitialized, isError, error } = useGetBooksQuery({
    // Books
    page: pagination.number,
    size: pagination.size,
    sortBy: pagination.sortBy,
    sortDir: pagination.sortDir,
    amount: pagination.amount,
    keyword: filters.keyword,
    cateId: filters.cate.id,
    rating: filters.rating,
    types: filters.types,
    value: filters.value,
    shopId: filters.shopId,
  });

  /**
   * Update filters
   */
  const updateFilters = () => {
    setFilters((prev) => ({
      ...prev,
      keyword: searchParams.get("q") ?? DEFAULT_FILTERS.keyword,
      cate: {
        id: searchParams.get("cate") ? +searchParams.get("cate") : "",
      },
      value: searchParams.get("value") ? searchParams.get("value").split(",").map(Number) : DEFAULT_FILTERS.value,
      types: searchParams.get("types")?.split(",") ?? DEFAULT_FILTERS.types,
      rating: searchParams.get("rating") ?? DEFAULT_FILTERS.rating,
    }));
    setPagination((prev) => ({
      ...prev,
      number: searchParams.get("pNo") ? searchParams.get("pNo") - 1 : DEFAULT_PAGINATION.number,
      size: searchParams.get("pSize") ?? DEFAULT_PAGINATION.size,
      sortBy: searchParams.get("sort") ?? DEFAULT_PAGINATION.sortBy,
      sortDir: searchParams.get("dir") ?? DEFAULT_PAGINATION.sortDir,
      amount: searchParams.get("amount") ?? DEFAULT_PAGINATION.amount,
    }));
  };

  // Update filter
  useEffect(() => {
    updateFilters();
  }, [searchParams]);

  /**
   * Scroll to top of page
   */
  const scrollToTop = useCallback(() => {
    scrollRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  /**
   * Handle change search keyword
   */
  const handleChangeKeyword = (newValue) => {
    setFilters((prev) => ({
      ...prev,
      keyword: newValue,
    }));
    newValue == DEFAULT_FILTERS.keyword ? searchParams.delete("q") : searchParams.set("q", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  };

  /**
   * Handle change category
   */
  const handleChangeCate = (newValue) => {
    newValue = filters?.cate.id == newValue?.id ? { id: "", slug: "" } : newValue;
    setFilters((prev) => ({
      ...prev,
      cate: newValue,
    }));
    newValue?.id == DEFAULT_FILTERS.cate.id ? searchParams.delete("cate") : searchParams.set("cate", newValue?.id);
    setSearchParams(searchParams);
    handleResetPage();
  };

  /**
   * Handle change input range
   */
  const handleChangeInputRange = (newValue) => {
    setFilters((prev) => ({ ...prev, value: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.value) ? searchParams.delete("value") : searchParams.set("value", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  };

  /**
   * Handle change range
   */
  const handleChangeRange = debounce((newValue) => {
    setFilters((prev) => ({ ...prev, value: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.value) ? searchParams.delete("value") : searchParams.set("value", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  }, 1000);

  /**
   * Handle change types
   */
  const handleChangeTypes = debounce((newValue) => {
    setFilters((prev) => ({ ...prev, types: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.types) ? searchParams.delete("types") : searchParams.set("types", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  }, 500);

  /**
   * Handle change rating
   */
  const handleChangeRating = (newValue) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating == newValue ? "" : newValue,
    }));
    newValue == DEFAULT_FILTERS.rating ? searchParams.delete("rating") : searchParams.set("rating", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  };

  /**
   * Handle apply filters
   */
  const handleApplyFilters = (newFilters) => {
    setFilters({ ...newFilters, shopId: id });
    newFilters.cate.id == DEFAULT_FILTERS.cate.id
      ? searchParams.delete("cate")
      : searchParams.set("cate", newFilters.cate.id);
    newFilters.keyword == DEFAULT_FILTERS.keyword
      ? searchParams.delete("q")
      : searchParams.set("q", newFilters.keyword);
    isEqual(newFilters.pubIds, DEFAULT_FILTERS.pubIds)
      ? searchParams.delete("pubs")
      : searchParams.set("pubs", newFilters.pubIds);
    isEqual(newFilters.types, DEFAULT_FILTERS.types)
      ? searchParams.delete("types")
      : searchParams.set("types", newFilters.types);
    isEqual(newFilters.value, DEFAULT_FILTERS.value)
      ? searchParams.delete("value")
      : searchParams.set("value", newFilters?.value);
    newFilters.rating == DEFAULT_FILTERS.rating
      ? searchParams.delete("rating")
      : searchParams.set("rating", newFilters.rating);
    setSearchParams(searchParams);
    handleResetPage();
  };

  /**
   * Handle change page
   */
  const handleChangePage = (page) => {
    setPagination((prev) => ({ ...prev, number: page - 1 }));
    page - 1 == DEFAULT_PAGINATION.number ? searchParams.delete("pNo") : searchParams.set("pNo", page);
    setSearchParams(searchParams);
    scrollToTop();
  };

  /**
   * Handle change order
   */
  const handleChangeOrder = (newValue) => {
    setPagination((prev) => ({ ...prev, sortBy: newValue }));
    newValue == DEFAULT_PAGINATION.sortBy ? searchParams.delete("sort") : searchParams.set("sort", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Handle change direction
   */
  const handleChangeDir = (newValue) => {
    setPagination((prev) => ({ ...prev, sortDir: newValue }));
    newValue == DEFAULT_PAGINATION.sortDir ? searchParams.delete("dir") : searchParams.set("dir", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Handle change size
   */
  const handleChangeSize = (newValue) => {
    setPagination((prev) => ({ ...prev, size: newValue }));
    newValue == DEFAULT_PAGINATION.size ? searchParams.delete("pSize") : searchParams.set("pSize", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Handle change amount
   */
  const handleChangeAmount = (newValue) => {
    setPagination((prev) => ({ ...prev, amount: newValue }));
    newValue == DEFAULT_PAGINATION.amount ? searchParams.delete("amount") : searchParams.set("amount", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Handle open pagination
   */
  const handleOpenPagination = () => {
    setOpenPagination(true);
  };

  /**
   * Handle close pagination
   */
  const handleClosePagination = () => {
    setOpenPagination(false);
  };

  /**
   * Handle reset page
   */
  const handleResetPage = () => {
    setPagination((prev) => ({
      ...prev,
      number: DEFAULT_PAGINATION.number,
    }));
    searchParams.delete("pNo");
    setSearchParams(searchParams, { replace: true });
    scrollToTop();
  };

  /**
   * Handle reset filters
   */
  const handleResetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, shopId: id });
    searchParams.delete("q");
    searchParams.delete("cate");
    searchParams.delete("pubs");
    searchParams.delete("value");
    searchParams.delete("types");
    searchParams.delete("rating");
    navigate({ pathname: `/shop/${id}`, search: searchParams.toString() });
    handleResetPage();
  };

  /**
   * Handle open filter drawer
   */
  const handleOpen = () => {
    setOpen(true);
  };

  /**
   * Handle close filter drawer
   */
  const handleClose = () => {
    setOpen(false);
  };

  //Stuff
  let loading = isLoading || isFetching || isError || isUninitialized;
  let isChanged = !isEqual(filters, DEFAULT_FILTERS);

  return (
    <>
      <Box display="relative">
        <CustomBreadcrumbs separator="›" maxItems={4} aria-label="breadcrumb">
          {data ? (
            [
              <NavLink to={"/shop"} key="shop">
                {t("shop.title")}
              </NavLink>,
              <NavLink to="#" key="shop-name">
                {data?.name}
              </NavLink>,
            ]
          ) : (
            <Skeleton variant="text" sx={{ fontSize: "16px" }} width={200} />
          )}
        </CustomBreadcrumbs>
        <HeaderComponent id={id} />
        <Grid container spacing={2} mt={2} size="grow" position="relative" display="flex" justifyContent="center">
          {tabletMode ? (
            <Suspense fallback={null}>
              <FilterDrawer
                {...{
                  filters,
                  onApplyFilters: handleApplyFilters,
                  onResetFilters: handleResetFilters,
                  open,
                  handleOpen,
                  handleClose,
                }}
              />
            </Suspense>
          ) : (
            <Grid size={{ xs: 12, md_lg: 2.8 }} position="relative">
              <Suspense fallback={null}>
                <FilterList
                  {...{
                    filters,
                    onResetFilters: handleResetFilters,
                    onChangeCate: handleChangeCate,
                    onChangeInputRange: handleChangeInputRange,
                    onChangeRange: handleChangeRange,
                    onChangeTypes: handleChangeTypes,
                    onChangeRating: handleChangeRating,
                    typesRef,
                    valueRef,
                    rateRef,
                    shopId: id,
                  }}
                />
              </Suspense>
            </Grid>
          )}
          <Grid
            ref={scrollRef}
            size={{ xs: 12, md_lg: 9.2 }}
            sx={(theme) => ({ scrollMargin: theme.mixins.toolbar.minHeight })}
            position="relative"
          >
            {!tabletMode && (
              <Suspense fallback={null}>
                <FiltersDisplay
                  {...{
                    filters,
                    setFilters,
                    onResetFilters: handleResetFilters,
                    onChangeCate: handleChangeCate,
                    onChangeInputRange: handleChangeInputRange,
                    onChangeKeyword: handleChangeKeyword,
                    onChangeTypes: handleChangeTypes,
                    onChangeRating: handleChangeRating,
                    defaultFilters: DEFAULT_FILTERS,
                    isChanged,
                    typesRef,
                    valueRef,
                    rateRef,
                  }}
                />
              </Suspense>
            )}
            <FilterSortList
              {...{
                pagination,
                mobileMode,
                onOpenFilters: handleOpen,
                isChanged,
                onOpenPagination: handleOpenPagination,
                onChangeOrder: handleChangeOrder,
                onChangeDir: handleChangeDir,
                onChangeAmount: handleChangeAmount,
                onPageChange: handleChangePage,
              }}
            />
            <FilteredProducts {...{ data, error, loading }} />
            <Pagination
              page={pagination?.number}
              size={pagination?.size}
              count={data?.totalPages ?? 0}
              onPageChange={handleChangePage}
              onSizeChange={handleChangeSize}
            />
            <Suspense fallback={null}>
              {openPagination != undefined && (
                <JumpPagination
                  {...{
                    pagination,
                    totalPages: data?.totalPages ?? 0,
                    onPageChange: handleChangePage,
                    open: openPagination,
                    handleClose: handleClosePagination,
                  }}
                />
              )}
            </Suspense>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ShopDetail;
