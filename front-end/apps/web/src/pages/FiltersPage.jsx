import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useParams, useSearchParams } from "react-router";
import { useGetCategoryQuery } from "../features/categories/categoriesApiSlice";
import { useGetBooksQuery, useGetBooksScrollInfiniteQuery } from "../features/books/booksApiSlice";
import { debounce, isEqual } from "lodash-es";
import { booksAmount, pageSizes, sortBooksBy } from "../utils/filters";
import { StoreSuggest, Wrapper } from "../components/custom/SortComponents";
import { useTranslation } from "react-i18next";
import { createCategoryCrumbs } from "../utils/common-utils";
import useMediaQuery from "@mui/material/useMediaQuery";
import Grid from "@mui/material/Grid";
import StoreOutlined from "@mui/icons-material/StoreOutlined";
import AppPagination from "../components/custom/AppPagination";
import CustomDivider from "../components/custom/CustomDivider";
import FilteredProducts from "../components/product/filter/FilteredProducts";
import FilterSortList from "../components/product/filter/FilterSortList";
import CustomBreadcrumbs from "../components/custom/CustomBreadcrumbs";

const FilterList = lazy(() => import("../components/product/filter/FilterList"));
const FilterDrawer = lazy(() => import("../components/product/filter/FilterDrawer"));
const FiltersDisplay = lazy(() => import("../components/product/filter/FiltersDisplay"));
const JumpPagination = lazy(() => import("../components/custom/JumpPagination"));

const DEFAULT_FILTERS = {
  keyword: "",
  cate: { id: "", slug: "" },
  pubIds: [],
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
  mode: "scroll",
};

const Pagination = memo(AppPagination);

const FiltersPage = () => {
  //#region construct
  const { cSlug } = useParams();
  const { t } = useTranslation();

  // Scroll ref
  const scrollRef = useRef(null);
  const pubsRef = useRef(null);
  const valueRef = useRef(null);
  const typesRef = useRef(null);
  const rateRef = useRef(null);

  // Responsive stuff
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md_lg"));

  const [open, setOpen] = useState(undefined); // Filter
  const [openPagination, setOpenPagination] = useState(undefined); // Pagination
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter & pagination
  const [filters, setFilters] = useState({
    keyword: searchParams.get("q") ?? DEFAULT_FILTERS.keyword,
    cate: {
      id: searchParams.get("cate") ?? DEFAULT_FILTERS.cate.id,
      slug: cSlug ?? DEFAULT_FILTERS.cate.slug,
    },
    pubIds: searchParams.get("pubs")?.split(",") ?? DEFAULT_FILTERS.pubIds,
    value: searchParams.get("value") ? searchParams.get("value").split(",").map(Number) : DEFAULT_FILTERS.value,
    types: searchParams.get("types")?.split(",") ?? DEFAULT_FILTERS.types,
    rating: searchParams.get("rating") ?? DEFAULT_FILTERS.rating,
  });
  const [pagination, setPagination] = useState({
    number: searchParams.get("pNo") ? searchParams.get("pNo") - 1 : DEFAULT_PAGINATION.number,
    size: searchParams.get("pSize") ?? DEFAULT_PAGINATION.size,
    sortBy: searchParams.get("sort") ?? DEFAULT_PAGINATION.sortBy,
    sortDir: searchParams.get("dir") ?? DEFAULT_PAGINATION.sortDir,
    amount: searchParams.get("amount") ?? DEFAULT_PAGINATION.amount,
    mode: searchParams.get("mode") ?? DEFAULT_PAGINATION.mode,
  });

  // Fetch data: pages mode uses getBooks, scroll mode uses getBooksScroll
  const { data, isLoading, isFetching, isUninitialized, isError, error } = useGetBooksQuery(
    {
      page: pagination.number,
      size: pagination.size,
      sortBy: pagination.sortBy,
      sortDir: pagination.sortDir,
      amount: pagination.amount,
      keyword: filters.keyword,
      cateId: filters.cate.id,
      rating: filters.rating,
      types: filters.types,
      pubIds: filters.pubIds,
      value: filters.value,
    },
    { skip: pagination.mode === "scroll" }
  );

  const {
    data: infiniteData,
    isLoading: infiniteLoading,
    isFetching: infiniteFetching,
    isFetchingNextPage,
    isError: infiniteError,
    error: infiniteErrorObj,
    fetchNextPage,
    hasNextPage,
  } = useGetBooksScrollInfiniteQuery(
    {
      size: pagination.size,
      sortBy: pagination.sortBy,
      sortDir: pagination.sortDir,
      amount: pagination.amount,
      keyword: filters.keyword,
      cateId: filters.cate.id,
      rating: filters.rating,
      types: filters.types,
      pubIds: filters.pubIds,
      value: filters.value,
    },
    { skip: pagination.mode !== "scroll" }
  );
  const { data: currCate, isLoading: loadCate } = useGetCategoryQuery(
    { slug: filters.cate.slug, include: "parent" },
    { skip: !filters.cate.id || !filters.cate.slug }
  );

  /**
   * Update filters and pagination from URL params
   */
  const updateFilters = () => {
    setFilters((prev) => ({
      ...prev,
      keyword: searchParams.get("q") ?? DEFAULT_FILTERS.keyword,
      cate: {
        id: searchParams.get("cate") ? +searchParams.get("cate") : "",
        slug: cSlug ?? DEFAULT_FILTERS.cate.slug,
      },
      pubIds: searchParams.get("pubs")?.split(",") ?? DEFAULT_FILTERS.pubIds,
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
      mode: searchParams.get("mode") ?? DEFAULT_PAGINATION.mode,
    }));
  };

  // Update filter and pagination from URL
  useEffect(() => {
    updateFilters();
  }, [cSlug, searchParams]);

  /**
   * Scroll to top
   */
  const scrollToTop = useCallback(() => {
    scrollRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  /**
   * Handle change keyword
   * @param {string} newValue
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
   * @param {Category} newValue
   */
  const handleChangeCate = (newValue) => {
    newValue = filters?.cate.id == newValue?.id ? { id: "", slug: "" } : newValue;
    setFilters((prev) => ({
      ...prev,
      cate: newValue,
      pubs: DEFAULT_FILTERS.pubIds,
    }));
    newValue?.id == DEFAULT_FILTERS.cate.id ? searchParams.delete("cate") : searchParams.set("cate", newValue?.id);
    searchParams.delete("pubs");
    const newPath = `/store${newValue?.slug ? `/${newValue.slug}` : ""}`;
    navigate({ pathname: newPath, search: searchParams.toString() });
    handleResetPage();
  };

  /**
   * Handle change publishers
   * @param {string[]} newValue
   */
  const handleChangePubs = debounce((newValue) => {
    setFilters((prev) => ({ ...prev, pubIds: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.pubIds) ? searchParams.delete("pubs") : searchParams.set("pubs", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  }, 500);

  /**
   * Handle change input range
   * @param {number[]} newValue
   */
  const handleChangeInputRange = (newValue) => {
    setFilters((prev) => ({ ...prev, value: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.value) ? searchParams.delete("value") : searchParams.set("value", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  };

  /**
   * Handle change range
   * @param {number[]} newValue
   */
  const handleChangeRange = debounce((newValue) => {
    setFilters((prev) => ({ ...prev, value: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.value) ? searchParams.delete("value") : searchParams.set("value", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  }, 1000);

  /**
   * Handle change types
   * @param {string[]} newValue
   */
  const handleChangeTypes = debounce((newValue) => {
    setFilters((prev) => ({ ...prev, types: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.types) ? searchParams.delete("types") : searchParams.set("types", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  }, 500);

  /**
   * Handle change rating
   * @param {number} newValue
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
   * @param {Filters} newFilters
   */
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
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
   * @param {number} page
   */
  const handleChangePage = (page) => {
    if (pagination.mode === "pages") {
      setPagination((prev) => ({ ...prev, number: page - 1 }));
    } else {
      setPagination((prev) => ({ ...prev, number: page - 1, mode: "pages" }));
      searchParams.set("mode", "pages");
    }
    page - 1 == DEFAULT_PAGINATION.number ? searchParams.delete("pNo") : searchParams.set("pNo", page);
    setSearchParams(searchParams);
    scrollToTop();
  };

  /**
   * Handle change order
   * @param {string} newValue
   */
  const handleChangeOrder = (newValue) => {
    setPagination((prev) => ({ ...prev, sortBy: newValue }));
    newValue == DEFAULT_PAGINATION.sortBy ? searchParams.delete("sort") : searchParams.set("sort", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Handle change direction
   * @param {string} newValue
   */
  const handleChangeDir = (newValue) => {
    setPagination((prev) => ({ ...prev, sortDir: newValue }));
    newValue == DEFAULT_PAGINATION.sortDir ? searchParams.delete("dir") : searchParams.set("dir", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Handle change size
   * @param {number} newValue
   */
  const handleChangeSize = (newValue) => {
    setPagination((prev) => ({ ...prev, size: newValue }));
    newValue == DEFAULT_PAGINATION.size ? searchParams.delete("pSize") : searchParams.set("pSize", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Handle change amount
   * @param {number} newValue
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
   * Handle change pagination mode
   * @param {string} mode
   */
  const handleChangePaginationMode = (mode) => {
    const currPage = infiniteData?.pageParams[infiniteData?.pageParams.length - 1] ?? DEFAULT_PAGINATION.number;
    searchParams.set("mode", mode);
    if (mode === "scroll") {
      searchParams.delete("pNo");
      searchParams.delete("mode");
    } else {
      if (currPage != DEFAULT_PAGINATION.number) searchParams.set("pNo", currPage + 1);
    }
    setSearchParams(searchParams, { replace: true });
    setPagination((prev) => ({ ...prev, mode, number: currPage }));
    scrollToTop();
  };

  /**
   * Handle load more items
   */
  const handleLoadMore = useCallback(() => {
    if (pagination.mode !== "scroll" || isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
    setPagination((prev) => ({ ...prev, number: prev.number + 1 }));
  }, [pagination.mode, pagination.number, fetchNextPage, hasNextPage, isFetchingNextPage]);

  /**
   * Scroll listener for infinite load
   */
  const handleWindowScroll = useCallback(
    debounce(() => {
      const trigger = document.body.scrollHeight - 700 < window.scrollY + window.innerHeight;
      if (trigger) handleLoadMore();
    }, 400),
    [handleLoadMore]
  );

  useEffect(() => {
    if (pagination.mode !== "scroll") return;
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [pagination.mode, handleWindowScroll]);

  /**
   * Handle reset filters
   */
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    searchParams.delete("q");
    searchParams.delete("cate");
    searchParams.delete("pubs");
    searchParams.delete("value");
    searchParams.delete("types");
    searchParams.delete("rating");
    navigate({ pathname: "/store", search: searchParams.toString() });
    handleResetPage();
  };

  /**
   * Handle open filters
   */
  const handleOpen = () => {
    setOpen(true);
  };

  /**
   * Handle close filters
   */
  const handleClose = () => {
    setOpen(false);
  };

  const loading =
    pagination.mode === "scroll"
      ? infiniteLoading || infiniteFetching || infiniteError
      : isLoading || isFetching || isError || isUninitialized;
  const isChanged = !isEqual(filters, DEFAULT_FILTERS);
  const displayData =
    pagination.mode === "scroll" && infiniteData?.pages
      ? (() => {
          const content = infiniteData.pages.flatMap((p) => p.content ?? []);
          const ids = content.map((b) => b.id);
          const entities = Object.fromEntries(content.map((b) => [b.id, b]));
          return { ids, entities };
        })()
      : data;
  const displayError = pagination.mode === "scroll" ? infiniteErrorObj : error;
  const totalPages =
    pagination.mode === "scroll" && infiniteData?.pages?.length
      ? (infiniteData.pages[infiniteData.pages.length - 1]?.totalPages ?? 0)
      : (data?.totalPages ?? 0);
  const isLastPage = pagination.mode === "scroll" && totalPages == pagination.number + 1;
  const breadcrumbItems = [
    { label: t("product.catalog"), href: "/store", end: true },
    ...createCategoryCrumbs(currCate),
    filters?.keyword && { label: t("search.results", { keyword: filters?.keyword }), href: "#" },
  ].filter(Boolean);
  //#endregion

  return (
    <Wrapper>
      <CustomBreadcrumbs items={breadcrumbItems} loading={loadCate} />
      <Grid container spacing={2} size="grow" position="relative" display="flex" justifyContent="center">
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
                defaultFilters: DEFAULT_FILTERS,
              }}
            />
          </Suspense>
        ) : (
          <Grid size={{ xs: 12, md_lg: 2.8 }} position="relative">
            <CustomDivider sx={{ mr: 2 }}>{t("search.filter.label")}</CustomDivider>
            <Suspense fallback={null}>
              <FilterList
                {...{
                  filters,
                  onResetFilters: handleResetFilters,
                  onChangeCate: handleChangeCate,
                  onChangePubs: handleChangePubs,
                  onChangeInputRange: handleChangeInputRange,
                  onChangeRange: handleChangeRange,
                  onChangeTypes: handleChangeTypes,
                  onChangeRating: handleChangeRating,
                  pubsRef,
                  typesRef,
                  valueRef,
                  rateRef,
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
          <CustomDivider sx={{ display: { xs: "none", md: "flex" } }}>{t("product.catalog")}</CustomDivider>
          {filters.keyword && (
            <NavLink to={`/shop?q=${filters.keyword}`}>
              <StoreSuggest>
                <StoreOutlined />
                &nbsp;
                <span>
                  {t("search.shop")}: '<b>{filters.keyword}</b>'
                </span>
              </StoreSuggest>
            </NavLink>
          )}
          {!tabletMode && (
            <Suspense fallback={null}>
              <FiltersDisplay
                {...{
                  filters,
                  setFilters,
                  onResetFilters: handleResetFilters,
                  onChangeCate: handleChangeCate,
                  onChangePubs: handleChangePubs,
                  onChangeInputRange: handleChangeInputRange,
                  onChangeKeyword: handleChangeKeyword,
                  onChangeTypes: handleChangeTypes,
                  onChangeRating: handleChangeRating,
                  defaultFilters: DEFAULT_FILTERS,
                  isChanged,
                  pubsRef,
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
              totalPages,
              mobileMode,
              onOpenFilters: handleOpen,
              isChanged,
              onOpenPagination: handleOpenPagination,
              onChangeOrder: handleChangeOrder,
              onChangeDir: handleChangeDir,
              onChangeAmount: handleChangeAmount,
              onPageChange: handleChangePage,
              onChangePaginationMode: handleChangePaginationMode,
            }}
          />
          <FilteredProducts
            {...{
              data: displayData,
              error: displayError,
              loading,
              mode: pagination.mode,
              isLastPage,
            }}
          />
          {pagination.mode === "pages" && (
            <Pagination
              page={pagination?.number}
              size={pagination?.size}
              count={totalPages}
              onPageChange={handleChangePage}
              onSizeChange={handleChangeSize}
            />
          )}
          <Suspense fallback={null}>
            {openPagination != undefined && (
              <JumpPagination
                {...{
                  pagination,
                  totalPages,
                  onPageChange: handleChangePage,
                  open: openPagination,
                  handleClose: handleClosePagination,
                }}
              />
            )}
          </Suspense>
        </Grid>
      </Grid>
    </Wrapper>
  );
};

export default FiltersPage;
