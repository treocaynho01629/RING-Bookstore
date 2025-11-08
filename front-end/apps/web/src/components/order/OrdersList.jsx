import { Fragment, Suspense, useCallback, useEffect, useRef, useState, lazy } from "react";
import { useGetOrdersByUserQuery } from "../../features/orders/ordersApiSlice";
import {
  MainContainer,
  StyledDialogTitle,
  StyledEmptyIcon,
  ToggleGroupContainer,
  MessageContainer,
  LoadContainer,
  PlaceholderContainer,
} from "../custom/ProfileComponents";
import { useSearchParams } from "react-router";
import { booksApiSlice } from "../../features/books/booksApiSlice";
import { CustomTab, CustomTabs } from "../custom/CustomTabs";
import { debounce } from "lodash-es";
import { Message } from "@ring/ui/Components";
import { getOrderStatus } from "@ring/shared/enums/order";
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

const OrderStatus = getOrderStatus();
const defaultSize = 5;

const OrdersList = ({ pending, setPending, mobileMode, tabletMode, handleClose }) => {
  const { addProduct } = useCart();
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
  const [pagination, setPagination] = useState({
    number: 0,
    size: defaultSize,
    totalPages: 0,
    isMore: true,
  });

  //Fetch orders
  const { data, isLoading, isFetching, isSuccess, isError, error } = useGetOrdersByUserQuery({
    status: filters.status,
    keyword: filters.keyword,
    page: pagination.number,
    size: pagination.size,
    loadMore: pagination.isMore,
  });
  const [getBought, { isLoading: fetching }] = booksApiSlice.useLazyGetBooksByIdsQuery();

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: searchParams.get("status") ?? "",
    }));
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

  //Change tab
  const handleChangeStatus = (e, newValue) => {
    setFilters((prev) => ({ ...prev, status: newValue, keyword: "" }));
    newValue === "" ? searchParams.delete("status") : searchParams.set("status", newValue);
    searchParams.delete("k");
    setSearchParams(searchParams);
    handleResetPage();
  };

  const handleChangeKeyword = (e) => {
    e.preventDefault();
    let newValue = inputRef.current.value;
    if (inputRef) setFilters((prev) => ({ ...prev, keyword: newValue }));
    newValue == "" ? searchParams.delete("k") : searchParams.set("k", newValue);
    setSearchParams(searchParams, { replace: true });
    handleResetPage();
  };

  const handleResetPage = () => {
    setPagination((prev) => ({ ...prev, number: 0 }));
    scrollToTop();
  };

  //Rebuy
  const handleAddToCart = async (detail) => {
    if (fetching || pending) return;
    setPending(true);

    const { enqueueSnackbar } = await import("notistack");

    const ids = detail?.items?.map((item) => item.bookId);
    getBought(ids) //Fetch books with new info
      .unwrap()
      .then((books) => {
        const { ids, entities } = books;

        ids.forEach((id) => {
          const book = entities[id];
          if (book.amount > 0) {
            //Check for stock
            addProduct(book, 1);
          } else {
            enqueueSnackbar("Sản phẩm đã hết hàng!", { variant: "error" });
          }
        });
        setPending(false);
      })
      .catch((rejected) => {
        console.error(rejected);
        enqueueSnackbar("Mua lại sản phẩm thất bại!", { variant: "error" });
        setPending(false);
      });
  };

  // Cancel
  const handleCancelOrder = (order) => {
    setContextOrder(order);
    setOpen(true);
  };

  const handleCloseForm = () => {
    setContextOrder(false);
    setOpen(false);
  };

  // Show more
  const handleShowMore = () => {
    const currentPage = data?.page;
    if (isFetching || typeof currentPage?.number !== "number" || currentPage?.number < pagination?.number) return;
    const nextPage = currentPage?.number + 1;
    if (nextPage < currentPage?.totalPages) setPagination((prev) => ({ ...prev, number: nextPage }));
  };

  const handleWindowScroll = (e) => {
    const trigger = document.body.scrollHeight - 700 < window.scrollY + window.innerHeight;
    if (trigger) handleShowMore();
  };

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

  let ordersContent;

  if (isLoading || (isFetching && pagination.number == 0)) {
    ordersContent = (
      <PlaceholderContainer>
        <LoadContainer>
          <CircularProgress color="primary" />
        </LoadContainer>
      </PlaceholderContainer>
    );
  } else if (isSuccess) {
    const { ids, entities } = data;

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
        <Message>
          <StyledEmptyIcon />
          Chưa có đơn hàng nào
        </Message>
      </MessageContainer>
    );
  } else if (isError) {
    ordersContent = (
      <MessageContainer>
        <Message color="error">{error?.error || "Đã xảy ra lỗi"}</Message>
      </MessageContainer>
    );
  }

  return (
    <>
      <StyledDialogTitle ref={scrollRef}>
        <a onClick={handleClose}>
          <KeyboardArrowLeft />
        </a>
        <Receipt />
        &nbsp;Đơn hàng của bạn
      </StyledDialogTitle>
      <ToggleGroupContainer>
        <CustomTabs value={filters.status} onChange={handleChangeStatus} variant="scrollable" scrollButtons="auto">
          <CustomTab label="Tất cả" value="" />
          {Object.values(OrderStatus).map((tab, index) => (
            <CustomTab key={`tab-${index}`} label={tab.label} value={tab.value} />
          ))}
        </CustomTabs>
      </ToggleGroupContainer>
      <DialogContent
        sx={{ py: 0, px: { xs: 0, sm: 2, md: 0 }, height: { xs: "100dvh", md: "auto" } }}
        onScroll={tabletMode ? scrollListener : undefined}
      >
        <form ref={mobileScrollRef} onSubmit={handleChangeKeyword}>
          <TextField
            placeholder="Tìm theo Mã, Tên Shop hoặc Tên sản phẩm"
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
          {pagination.number > 0 && isFetching && (
            <LoadContainer>
              <CircularProgress size={30} color="primary" />
            </LoadContainer>
          )}
          {data?.ids?.length > 0 && data?.ids?.length == data?.totalElements && (
            <Message color="warning">Không còn đơn hàng nào!</Message>
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
