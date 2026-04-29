import { Fragment, Suspense, useCallback, useEffect, useRef, useState, lazy } from "react";
import { useGetOrdersByUserScrollInfiniteQuery } from "../../features/orders/ordersApiSlice";
import {
  MainContainer,
  StyledDialogTitle,
  ToggleGroupContainer,
  MessageContainer,
  LoadContainer,
  PlaceholderContainer,
} from "../custom/ProfileComponents";
import { Link, useSearchParams } from "react-router";
import { capitalize } from "lodash-es";
import { booksApiSlice } from "../../features/books/booksApiSlice";
import { CustomTab, CustomTabs } from "../custom/CustomTabs";
import { debounce } from "lodash-es";
import { Message } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import { orderStatusOptions } from "@ring/shared/enums/order";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import Receipt from "@mui/icons-material/Receipt";
import Search from "@mui/icons-material/Search";
import useCart from "../../hooks/useCart";
import OrderItem from "./OrderItem";

const CancelAndRefundDetailForm = lazy(() => import("./CancelAndRefundDetailForm"));

const DEFAULT_SIZE = 5;

const OrdersList = ({ pending, setPending, mobileMode, tabletMode }) => {
  const { addProduct } = useCart();
  const { t } = useTranslation();

  const scrollRef = useRef(null);
  const mobileScrollRef = useRef(null);
  const inputRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  const [contextOrder, setContextOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: searchParams.get("status") ?? "",
    keyword: searchParams.get("k") ?? "",
  });

  // Fetch orders
  const { data, isLoading, isSuccess, isError, error, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetOrdersByUserScrollInfiniteQuery({
      status: filters.status,
      keyword: filters.keyword,
      size: DEFAULT_SIZE,
    });
  const [getBought, { isLoading: fetching }] = booksApiSlice.useLazyGetBooksByIdsQuery();

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: searchParams.get("status") ?? "",
    }));
  }, [searchParams]);

  /**
   * Scroll to top of the list
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
   * Change order status tab
   */
  const handleChangeStatus = (e, newValue) => {
    setFilters((prev) => ({ ...prev, status: newValue, keyword: "" }));
    newValue === "" ? searchParams.delete("status") : searchParams.set("status", newValue);
    searchParams.delete("k");
    setSearchParams(searchParams, { replace: true });
    scrollToTop();
  };

  /**
   * Change order keyword
   */
  const handleChangeKeyword = (e) => {
    e.preventDefault();
    let newValue = inputRef.current.value;
    if (inputRef) setFilters((prev) => ({ ...prev, keyword: newValue }));
    newValue == "" ? searchParams.delete("k") : searchParams.set("k", newValue);
    setSearchParams(searchParams, { replace: true });
    scrollToTop();
  };

  /**
   * Rebuy product
   */
  const handleAddToCart = async (detail) => {
    if (fetching || pending) return;
    setPending(true);

    const { enqueueSnackbar } = await import("notistack");

    const ids = detail?.items?.map((item) => item.bookId);
    getBought(ids, true) // Fetch books with new info
      .unwrap()
      .then((books) => {
        const { ids, entities } = books;

        ids.forEach((id) => {
          const book = entities[id];
          if (book.amount > 0) {
            // Check for stock
            addProduct(book, 1);
          } else {
            enqueueSnackbar(t("product.out"), { variant: "error" });
          }
        });
        setPending(false);
      })
      .catch((rejected) => {
        console.error(rejected);
        enqueueSnackbar(t("message.error", { action: t("cart.add") }), { variant: "error" });
        setPending(false);
      });
  };

  /**
   * Cancel order
   */
  const handleCancelOrder = (order) => {
    setContextOrder(order);
    setOpen(true);
  };

  /**
   * Close cancel and refund detail form
   */
  const handleCloseForm = () => {
    setContextOrder(false);
    setOpen(false);
  };

  /**
   * Show more orders
   */
  const handleShowMore = () => {
    if (isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  };

  /**
   * Handle window scroll
   */
  const handleWindowScroll = (e) => {
    const trigger = document.body.scrollHeight - 700 < window.scrollY + window.innerHeight;
    if (trigger) handleShowMore();
  };

  /**
   * Handle scroll
   */
  const handleScroll = (e) => {
    const trigger = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (trigger) handleShowMore();
  };

  /**
   * Handle window scroll listener
   */
  const windowScrollListener = useCallback(debounce(handleWindowScroll, 500), [data]);
  const scrollListener = useCallback(debounce(handleScroll, 500), [data]);

  useEffect(() => {
    window.removeEventListener("scroll", windowScrollListener);
    if (!tabletMode) window.addEventListener("scroll", windowScrollListener);

    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [tabletMode, data]);

  let ordersContent;

  if (isLoading) {
    ordersContent = (
      <PlaceholderContainer>
        <LoadContainer>
          <CircularProgress color="primary" />
        </LoadContainer>
      </PlaceholderContainer>
    );
  } else if (isSuccess) {
    const content = data?.pages?.flatMap((p) => p.content ?? []);
    const ids = content.map((b) => b.id);
    const entities = Object.fromEntries(content.map((b) => [b.id, b]));

    ordersContent = ids?.length ? (
      ids?.map((id, index) => {
        const order = entities[id];

        return (
          <Fragment key={`order-${id}-${index}`}>
            <OrderItem
              {...{
                order,
                handleAddToCart,
                handleCancelOrder,
              }}
            />
          </Fragment>
        );
      })
    ) : (
      <MessageContainer>
        <Message>{capitalize(t("message.empty", { item: t("order.label") }))}</Message>
      </MessageContainer>
    );
  } else if (isError) {
    ordersContent = (
      <MessageContainer>
        <Message color="error">{error?.error || t("error.general")}</Message>
      </MessageContainer>
    );
  }

  return (
    <>
      <StyledDialogTitle ref={scrollRef}>
        <Link to={-1}>
          <KeyboardArrowLeft />
        </Link>
        <Receipt />
        &nbsp;{t("order.your", { ns: "authenticated" })}
      </StyledDialogTitle>
      <ToggleGroupContainer>
        <CustomTabs value={filters.status} onChange={handleChangeStatus} variant="scrollable" scrollButtons="auto">
          <CustomTab label={t("all.label")} value="" />
          {orderStatusOptions.map((status, index) => (
            <CustomTab key={`tab-${index}`} label={t(status.label)} value={status.value} />
          ))}
        </CustomTabs>
      </ToggleGroupContainer>
      <DialogContent
        sx={{ py: 0, px: { xs: 0, sm: 2, md: 0 }, height: { xs: "100dvh", md: "auto" } }}
        onScroll={tabletMode ? scrollListener : undefined}
      >
        <form ref={mobileScrollRef} onSubmit={handleChangeKeyword}>
          <TextField
            placeholder={t("order.search", { ns: "authenticated" })}
            autoComplete="order"
            id="order"
            size="small"
            defaultValue={searchParams.get("k")}
            inputRef={inputRef}
            fullWidth
            error={inputRef?.current?.value != filters.keyword}
            sx={{ py: { xs: 1, md: 2 } }}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ marginRight: 1 }} />,
              },
            }}
          />
        </form>
        <MainContainer>
          {ordersContent}
          {isFetchingNextPage && (
            <LoadContainer>
              <CircularProgress size={30} color="primary" />
            </LoadContainer>
          )}
          {data?.pages[0]?.totalElements > 0 && !hasNextPage && (
            <Message color="warning">{capitalize(t("message.out", { item: t("order.label") }))}</Message>
          )}
        </MainContainer>
      </DialogContent>
      <Dialog
        maxWidth={"sm"}
        fullWidth
        open={open}
        onClose={handleCloseForm}
        fullScreen={mobileMode}
        closeAfterTransition={false}
        aria-labelledby="cancel-dialog"
      >
        {open && (
          <Suspense fallback={null}>
            <CancelAndRefundDetailForm
              {...{
                pending,
                setPending,
                id: contextOrder?.id,
                handleClose: handleCloseForm,
              }}
            />
          </Suspense>
        )}
      </Dialog>
    </>
  );
};

export default OrdersList;
