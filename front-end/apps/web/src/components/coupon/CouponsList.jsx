import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageContainer,
  StyledDialogTitle,
  LoadContainer,
  PlaceholderContainer,
  MainContainer,
  StyledEmptyIcon,
  ToggleGroupContainer,
} from "../custom/ProfileComponents";
import { useSearchParams } from "react-router";
import { CustomTab, CustomTabs } from "../custom/CustomTabs";
import { debounce } from "lodash-es";
import { Message } from "@ring/ui/Components";
import { getCouponCriteria, getCouponType } from "@ring/shared/enums/coupon";
import { useGetCouponsQuery } from "../../features/coupons/couponsApiSlice";
import { trackWindowScroll } from "react-lazy-load-image-component";
import { CouponType } from "@ring/shared/models/couponType";
import { capitalize } from "lodash-es";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import Loyalty from "@mui/icons-material/Loyalty";
import CouponItem from "./CouponItem";
import useCoupon from "../../hooks/useCoupon";

const defaultSize = 10;
const couponItems = [
  {
    label: "saved",
    filter: {
      saved: true,
    },
  },
  {
    label: "ring",
    filter: {
      byShop: false,
    },
  },
  {
    label: "store",
    filter: {
      byShop: true,
    },
  },
];

Object.values(CouponType).forEach((item) => {
  couponItems.push({
    label: getCouponType(item).label,
    filter: {
      types: [item],
    },
  });
});

const CouponsList = ({ scrollPosition, mobileMode, tabletMode, handleClose }) => {
  const { t } = useTranslation();
  const { coupons: savedCoupons } = useCoupon();
  const scrollRef = useRef(null);
  const mobileScrollRef = useRef(null);
  const inputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [tab, setTab] = useState(searchParams.get("tab") ? +searchParams.get("tab") : "");
  const [filters, setFilters] = useState({
    ...couponItems[tab]?.filter,
    code: searchParams.get("k") ?? "",
  });
  const [pagination, setPagination] = useState({
    number: 0,
    size: defaultSize,
    totalPages: 0,
    isMore: true,
  });

  // Fetch coupons
  const { data, isLoading, isFetching, isSuccess, isError, error } = useGetCouponsQuery({
    byShop: filters.byShop,
    code: filters.code,
    types: filters.types ?? "",
    codes: filters.saved ? (savedCoupons?.length > 0 ? savedCoupons : ["temp"]) : [],
    page: pagination?.number,
    size: pagination?.size,
    showUsed: true,
    showExpired: true,
    loadMore: pagination?.isMore,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...couponItems[tab]?.filter,
      code: prev.code,
    }));
  }, [tab]);

  useEffect(() => {
    setTab(searchParams.get("tab") ? +searchParams.get("tab") : "");
  }, [searchParams]);

  useEffect(() => {
    if (data && !isLoading && isSuccess) {
      setPagination({
        ...pagination,
        number: data.page,
        totalPages: data.totalPages,
      });
    }
  }, [data]);

  /**
   * Scroll to top of list
   */
  const scrollToTop = useCallback(() => {
    if (mobileMode) {
      mobileScrollRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      scrollRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  /**
   * Change tab list
   * @param {Event} e - Event
   * @param {number} newValue - New value
   */
  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
    setFilters((prev) => ({ ...prev, keyword: "" }));
    newValue === "" ? searchParams.delete("tab") : searchParams.set("tab", newValue);
    searchParams.delete("k");
    setSearchParams(searchParams);
    handleResetPage();
  };

  /**
   * Change code input
   * @param {Event} e - Event
   */
  const handleChangeCode = (e) => {
    e.preventDefault();
    let newValue = inputRef.current.value;
    if (inputRef) setFilters((prev) => ({ ...prev, code: newValue }));
    newValue == "" ? searchParams.delete("k") : searchParams.set("k", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  /**
   * Reset page
   */
  const handleResetPage = () => {
    setPagination((prev) => ({ ...prev, number: 0 }));
    scrollToTop();
  };

  /**
   * Show more coupons on scroll
   */
  const handleShowMore = () => {
    if (isFetching || typeof data?.page !== "number" || data?.page < pagination?.number) return;
    const nextPage = data?.page + 1;
    if (nextPage < data?.totalPages) setPagination((prev) => ({ ...prev, number: nextPage }));
  };

  /**
   * Handle window scroll
   * @param {Event} e - Event
   */
  const handleWindowScroll = (e) => {
    const trigger = document.body.scrollHeight - 300 < window.scrollY + window.innerHeight;
    if (trigger) handleShowMore();
  };

  /**
   * Handle scroll list
   * @param {Event} e - Event
   */
  const handleScroll = (e) => {
    const trigger = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (trigger) handleShowMore();
  };

  const windowScrollListener = useCallback(debounce(handleWindowScroll, 500), [data]);
  const scrollListener = useCallback(debounce(handleScroll, 500), [data]);

  useEffect(() => {
    window.removeEventListener("scroll", windowScrollListener);
    if (!tabletMode) window.addEventListener("scroll", windowScrollListener);

    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [tabletMode, data]);

  let couponsContent;

  if (isLoading || (isFetching && pagination.number == 0)) {
    couponsContent = (
      <PlaceholderContainer>
        <LoadContainer>
          <CircularProgress color="primary" />
        </LoadContainer>
      </PlaceholderContainer>
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

    couponsContent = ids?.length ? (
      ids?.map((id, index) => {
        const coupon = entities[id];
        const couponInfo = {
          ...coupon,
          isUsed: coupon?.isUsed,
          isSaved: savedCoupons?.indexOf(coupon?.code) != -1,
          meta: getCouponType(coupon?.type),
          criteria: getCouponCriteria(coupon?.criteria),
        };

        return (
          <Grid key={`coupon-${id}-${index}`} size={{ xs: 12, sm_md: 6, md: 12, md_lg: 6 }}>
            <CouponItem
              {...{
                coupon: couponInfo,
                className: "display",
                scrollPosition,
              }}
            />
          </Grid>
        );
      })
    ) : (
      <MessageContainer>
        <Message>
          <StyledEmptyIcon />
          {capitalize(t("message.empty", { item: t("coupon.label") }))}
        </Message>
      </MessageContainer>
    );
  } else if (isError) {
    couponsContent = (
      <MessageContainer>
        <Message color="error">{error?.error || t("error.general")}</Message>
      </MessageContainer>
    );
  }

  return (
    <>
      <StyledDialogTitle ref={scrollRef}>
        <a onClick={handleClose}>
          <KeyboardArrowLeft />
        </a>
        <Loyalty />
        &nbsp;{t("coupon.label")}
      </StyledDialogTitle>
      <ToggleGroupContainer>
        <CustomTabs value={tab} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
          <CustomTab label={t("all")} value="" />
          {couponItems.map((tab, index) => (
            <CustomTab key={`tab-${index}`} label={t(tab?.label)} value={index} />
          ))}
        </CustomTabs>
      </ToggleGroupContainer>
      <DialogContent
        sx={{ py: 0, px: { xs: 0, sm: 2, md: 0 }, height: { xs: "100dvh", md: "auto" } }}
        onScroll={tabletMode ? scrollListener : undefined}
      >
        <form ref={mobileScrollRef} onSubmit={handleChangeCode}>
          <TextField
            placeholder={t("coupon.add")}
            autoComplete="code"
            id="code"
            size="small"
            defaultValue={searchParams.get("k")}
            inputRef={inputRef}
            fullWidth
            error={inputRef?.current?.value != filters.code}
            sx={{ py: { xs: 1, md: 2 } }}
            slotProps={{
              input: {
                startAdornment: <LocalActivityOutlined style={{ color: "gray", marginRight: "5px" }} />,
              },
            }}
          />
        </form>
        <MainContainer>
          <Grid container spacing={1}>
            {couponsContent}
          </Grid>
          {pagination.number > 0 && isFetching && (
            <LoadContainer>
              <CircularProgress size={30} color="primary" />
            </LoadContainer>
          )}
          {data?.ids?.length > 0 && data?.ids?.length == data?.totalElements && (
            <Message color="warning">{capitalize(t("message.out", { item: t("coupon.label") }))}</Message>
          )}
        </MainContainer>
      </DialogContent>
    </>
  );
};

export default trackWindowScroll(CouponsList);
