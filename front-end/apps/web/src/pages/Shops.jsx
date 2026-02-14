import styled from "@emotion/styled";
import { useState, Suspense, lazy, useEffect, useCallback, useRef, memo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import {
  useFollowShopMutation,
  useGetDisplayShopsQuery,
  useUnfollowShopMutation,
} from "../features/shops/shopsApiSlice";
import { filterShopsBy, filterShopsValue, pageSizes, sortShopsBy } from "../utils/filters";
import { capitalize } from "lodash-es";
import { useTranslation } from "react-i18next";
import { Wrapper } from "../components/custom/SortComponents";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import Close from "@mui/icons-material/Close";
import TipsAndUpdatesOutlined from "@mui/icons-material/TipsAndUpdatesOutlined";
import CustomBreadcrumbs from "../components/custom/CustomBreadcrumbs";
import AppPagination from "../components/custom/AppPagination";
import CustomDivider from "../components/custom/CustomDivider";
import Progress from "@ring/ui/Progress";
import Shop from "../components/shop/Shop";
import ShopSortList from "../components/shop/ShopSortList";
import useAuth from "../hooks/useAuth";

// TODO: Scroll + jump
const JumpPagination = lazy(() => import("../components/custom/JumpPagination"));

//#region styled
const Container = styled.div`
  width: 100%;
  min-height: 90dvh;
  position: relative;
  scroll-margin: ${({ theme }) => theme.mixins.toolbar.minHeight}px;
`;

const ShopsContainer = styled.div`
  width: 100%;
  min-height: 90dvh;
  position: relative;
  padding: 0;
`;

const ClearButton = styled.div`
  cursor: pointer;
  transition: all 0.2s ease;
  height: 24px;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme }) => theme.vars.palette.error.main};
    }
  }
`;

const Keyword = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 10px 0;

  span {
    display: flex;
    align-items: center;

    b {
      color: ${({ theme }) => theme.vars.palette.warning.main};
    }
  }
`;
//#endregion

const DEFAULT_PAGINATION = {
  number: 0,
  size: pageSizes[0],
  sortBy: sortShopsBy[0].value,
  sortDir: "desc",
  followed: filterShopsBy[0].value,
};

const Pagination = memo(AppPagination);

const Shops = () => {
  const { t } = useTranslation();
  const { username } = useAuth();

  const scrollRef = useRef(null);
  const mobileMode = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const tabletMode = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [searchParams, setSearchParams] = useSearchParams();
  const [openPagination, setOpenPagination] = useState(undefined); // Pagination
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [pagination, setPagination] = useState({
    number: searchParams.get("pNo") ? searchParams.get("pNo") - 1 : DEFAULT_PAGINATION.number,
    size: searchParams.get("pSize") ?? DEFAULT_PAGINATION.size,
    sortBy: searchParams.get("sort") ?? DEFAULT_PAGINATION.sortBy,
    sortDir: searchParams.get("dir") ?? DEFAULT_PAGINATION.sortDir,
    followed: searchParams.get("followed") ?? DEFAULT_PAGINATION.followed,
  });
  const [followShop, { isLoading: following }] = useFollowShopMutation();
  const [unfollowShop, { isLoading: unfollowing }] = useUnfollowShopMutation();

  const location = useLocation();
  const navigate = useNavigate();

  const { data, isLoading, isFetching, isUninitialized, isSuccess, isError, error } = useGetDisplayShopsQuery({
    page: pagination.number,
    size: pagination.size,
    sortBy: pagination.sortBy,
    sortDir: pagination.sortDir,
    followed: filterShopsValue[pagination.followed],
    keyword: keyword,
  });

  /**
   * Update filters
   */
  const updateFilters = () => {
    setKeyword(searchParams.get("q") ?? "");
    setPagination((prev) => ({
      ...prev,
      number: searchParams.get("pNo") ? searchParams.get("pNo") - 1 : DEFAULT_PAGINATION.number,
      size: searchParams.get("pSize") ?? DEFAULT_PAGINATION.size,
      sortBy: searchParams.get("sort") ?? DEFAULT_PAGINATION.sortBy,
      sortDir: searchParams.get("dir") ?? DEFAULT_PAGINATION.sortDir,
      followed: searchParams.get("followed") ?? DEFAULT_PAGINATION.followed,
    }));
  };

  useEffect(() => {
    updateFilters();
  }, [searchParams]);

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
   * Change page
   * @param {number} page
   */
  const handleChangePage = (page) => {
    setPagination((prev) => ({ ...prev, number: page - 1 }));
    page - 1 == DEFAULT_PAGINATION.number ? searchParams.delete("pNo") : searchParams.set("pNo", page);
    setSearchParams(searchParams);
    scrollToTop();
  };

  /**
   * Change sort by
   * @param {string} newValue
   */
  const handleChangeOrder = (newValue) => {
    setPagination((prev) => ({ ...prev, sortBy: newValue }));
    newValue == DEFAULT_PAGINATION.sortBy ? searchParams.delete("sort") : searchParams.set("sort", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Change sort direction
   * @param {string} newValue
   */
  const handleChangeDir = (newValue) => {
    setPagination((prev) => ({ ...prev, sortDir: newValue }));
    newValue == DEFAULT_PAGINATION.sortDir ? searchParams.delete("dir") : searchParams.set("dir", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Change page size
   * @param {number} newValue
   */
  const handleChangeSize = (newValue) => {
    setPagination((prev) => ({ ...prev, size: newValue }));
    newValue == DEFAULT_PAGINATION.size ? searchParams.delete("pSize") : searchParams.set("pSize", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Change followed filter
   * @param {string} newValue
   */
  const handleChangeFollowed = (newValue) => {
    setPagination((prev) => ({ ...prev, followed: newValue }));
    newValue == DEFAULT_PAGINATION.followed ? searchParams.delete("followed") : searchParams.set("followed", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Clear keyword
   */
  const handleClearKeyword = () => {
    setKeyword("");
    searchParams.delete("q");
    setSearchParams(searchParams);
    handleResetPage();
  };

  /**
   * Reset page
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
   * Click follow
   * @param {Object} shop
   */
  const handleClickFollow = (shop) => {
    if (!username) navigate("/auth/login", { state: { from: location } });
    if (isLoading || following || unfollowing || !username) return;

    if (shop?.followed) {
      unfollowShop(shop?.id)
        .unwrap()
        .catch((err) => {
          console.error(err);
        });
    } else {
      followShop(shop?.id)
        .unwrap()
        .catch((err) => {
          console.error(err);
        });
    }
  };

  /**
   * Open pagination
   */
  const handleOpenPagination = () => {
    setOpenPagination(true);
  };

  /**
   * Close pagination
   */
  const handleClosePagination = () => {
    setOpenPagination(false);
  };

  let shopsContent;

  if (isSuccess) {
    const { ids, entities } = data;

    shopsContent = ids?.length ? (
      ids?.map((id, index) => {
        const shop = entities[id];

        return (
          <Grid key={id} size={{ xs: 12, sm: 6, md_lg: 4 }}>
            <Shop
              {...{
                shop,
                onClickFollow: handleClickFollow,
              }}
            />
          </Grid>
        );
      })
    ) : (
      <Box sx={{ mt: 2, width: "100%", textAlign: "center" }}>
        {capitalize(t("message.none", { item: t("store") }))}
      </Box>
    );
  } else if (isError) {
    shopsContent = <Box sx={{ mt: 2, width: "100%", textAlign: "center" }}>{error?.error ?? t("error.general")}</Box>;
  }

  const loading = isLoading || isFetching || isError || isUninitialized;
  const breadcrumbItems = [
    { label: t("shop.title"), href: "/shop", end: true },
    keyword && { label: keyword, href: "#" },
  ].filter(Boolean);

  return (
    <Wrapper>
      <CustomBreadcrumbs items={breadcrumbItems} loading={loading} />
      <Container ref={scrollRef}>
        <CustomDivider sx={{ display: { xs: "none", md: "flex" } }}>{t("shop.title")}</CustomDivider>
        {!tabletMode && keyword && (
          <Keyword>
            <span>
              <TipsAndUpdatesOutlined />
              &nbsp;{t("shop.related")}: '<b>{keyword}</b>'
            </span>
            <ClearButton onClick={handleClearKeyword}>
              <Close />
            </ClearButton>
          </Keyword>
        )}
        <ShopSortList
          {...{ pagination, mobileMode, keyword, totalPages: data?.totalPages ?? 0 }}
          onOpenPagination={handleOpenPagination}
          onChangeOrder={handleChangeOrder}
          onChangeDir={handleChangeDir}
          onChangeFollowed={handleChangeFollowed}
          onPageChange={handleChangePage}
          onClearKeyword={handleClearKeyword}
        />
        <ShopsContainer>
          <Grid container spacing={1}>
            {loading && <Progress color={isError ? "error" : "primary"} />}
            {shopsContent}
          </Grid>
        </ShopsContainer>
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
      </Container>
    </Wrapper>
  );
};

export default Shops;
