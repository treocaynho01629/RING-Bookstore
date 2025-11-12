import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useParams, useSearchParams } from "react-router";
import { useGetCategoryQuery } from "../features/categories/categoriesApiSlice";
import { useGetBooksQuery } from "../features/books/booksApiSlice";
import { debounce, isEqual } from "lodash-es";
import useTitle from "@ring/shared/useTitle";
import { booksAmount, pageSizes, sortBooksBy } from "../utils/filters";
import { StoreSuggest, Wrapper } from "../components/custom/SortComponents";
import useMediaQuery from "@mui/material/useMediaQuery";
import Skeleton from "@mui/material/Skeleton";
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
};

const createCrumbs = (cate) => {
  if (cate) {
    return [
      createCrumbs(cate?.parent),
      <NavLink to={`/store/${cate?.slug}?cate=${cate?.id}`} end key={`crumb-${cate?.id}`}>
        {cate?.name}
      </NavLink>,
    ];
  }
  return;
};

const Pagination = memo(AppPagination);

const FiltersPage = () => {
  //#region construct
  const { cSlug } = useParams();

  //Scroll ref
  const scrollRef = useRef(null);
  const pubsRef = useRef(null);
  const valueRef = useRef(null);
  const typesRef = useRef(null);
  const rateRef = useRef(null);

  //Responsive stuff
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md_lg"));

  const [open, setOpen] = useState(undefined); //Filter
  const [openPagination, setOpenPagination] = useState(undefined); //Pagination
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  //Filter & pagination
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
  });

  //Fetch data
  const { data, isLoading, isFetching, isUninitialized, isError, error } = useGetBooksQuery({
    //Books
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
  });
  const { data: currCate, isLoading: loadCate } = useGetCategoryQuery(
    { slug: filters.cate.slug, include: "parent" },
    { skip: !filters.cate.id || !filters.cate.slug }
  );

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
    }));
  };

  // Update filter
  useEffect(() => {
    updateFilters();
  }, [cSlug, searchParams]);

  // Set title
  useTitle("Cửa hàng");

  // Handle change
  const scrollToTop = useCallback(() => {
    scrollRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  //Filter change
  const handleChangeKeyword = (newValue) => {
    setFilters((prev) => ({
      ...prev,
      keyword: newValue,
    }));
    newValue == DEFAULT_FILTERS.keyword ? searchParams.delete("q") : searchParams.set("q", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  };
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
  const handleChangePubs = debounce((newValue) => {
    setFilters((prev) => ({ ...prev, pubIds: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.pubIds) ? searchParams.delete("pubs") : searchParams.set("pubs", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  }, 500);
  const handleChangeInputRange = (newValue) => {
    setFilters((prev) => ({ ...prev, value: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.value) ? searchParams.delete("value") : searchParams.set("value", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  };
  const handleChangeRange = debounce((newValue) => {
    setFilters((prev) => ({ ...prev, value: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.value) ? searchParams.delete("value") : searchParams.set("value", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  }, 1000);
  const handleChangeTypes = debounce((newValue) => {
    setFilters((prev) => ({ ...prev, types: newValue }));
    isEqual(newValue, DEFAULT_FILTERS.types) ? searchParams.delete("types") : searchParams.set("types", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  }, 500);
  const handleChangeRating = (newValue) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating == newValue ? "" : newValue,
    }));
    newValue == DEFAULT_FILTERS.rating ? searchParams.delete("rating") : searchParams.set("rating", newValue);
    setSearchParams(searchParams);
    handleResetPage();
  };
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

  // Pagination change
  const handleChangePage = (page) => {
    setPagination((prev) => ({ ...prev, number: page - 1 }));
    page - 1 == DEFAULT_PAGINATION.number ? searchParams.delete("pNo") : searchParams.set("pNo", page);
    setSearchParams(searchParams);
    scrollToTop();
  };
  const handleChangeOrder = (newValue) => {
    setPagination((prev) => ({ ...prev, sortBy: newValue }));
    newValue == DEFAULT_PAGINATION.sortBy ? searchParams.delete("sort") : searchParams.set("sort", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };
  const handleChangeDir = (newValue) => {
    setPagination((prev) => ({ ...prev, sortDir: newValue }));
    newValue == DEFAULT_PAGINATION.sortDir ? searchParams.delete("dir") : searchParams.set("dir", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };
  const handleChangeSize = (newValue) => {
    setPagination((prev) => ({ ...prev, size: newValue }));
    newValue == DEFAULT_PAGINATION.size ? searchParams.delete("pSize") : searchParams.set("pSize", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };
  const handleChangeAmount = (newValue) => {
    setPagination((prev) => ({ ...prev, amount: newValue }));
    newValue == DEFAULT_PAGINATION.amount ? searchParams.delete("amount") : searchParams.set("amount", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  //Pagination jump
  const handleOpenPagination = () => {
    setOpenPagination(true);
  };
  const handleClosePagination = () => {
    setOpenPagination(false);
  };

  //Reset page
  const handleResetPage = () => {
    setPagination((prev) => ({
      ...prev,
      number: DEFAULT_PAGINATION.number,
    }));
    searchParams.delete("pNo");
    setSearchParams(searchParams, { replace: true });
    scrollToTop();
  };

  //Reset
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

  //Stuff
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  //Stuff
  let loading = isLoading || isFetching || isError || isUninitialized;
  let isChanged = !isEqual(filters, DEFAULT_FILTERS);
  //#endregion

  return (
    <Wrapper>
      <CustomBreadcrumbs separator="›" maxItems={4} aria-label="breadcrumb">
        {!loadCate ? (
          [
            <NavLink to={"/store"} end key={"store"}>
              Danh mục sản phẩm
            </NavLink>,
            cSlug && createCrumbs(currCate),
            filters?.keyword && (
              <NavLink to={"#"} key={"keyword"}>
                {`Kết quả tìm kiếm: "${filters?.keyword}"`}
              </NavLink>
            ),
          ]
        ) : (
          <Skeleton variant="text" sx={{ fontSize: "16px" }} width={200} />
        )}
      </CustomBreadcrumbs>
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
            <CustomDivider sx={{ mr: 2 }}>BỘ LỌC</CustomDivider>
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
          <CustomDivider sx={{ display: { xs: "none", md: "flex" } }}>DANH MỤC SẢN PHẨM</CustomDivider>
          {filters.keyword && (
            <NavLink to={`/shop?q=${filters.keyword}`}>
              <StoreSuggest>
                <StoreOutlined />
                &nbsp;
                <span>
                  Tìm kiếm của hàng với từ khoá: '<b>{filters.keyword}</b>'
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
              totalPages: data?.totalPages ?? 0,
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
    </Wrapper>
  );
};

export default FiltersPage;
