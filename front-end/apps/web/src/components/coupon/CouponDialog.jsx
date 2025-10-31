import { useEffect, useRef, useState } from "react";
import {
  useGetCouponQuery,
  useGetCouponsQuery,
} from "../../features/coupons/couponsApiSlice";
import { getCouponType, getCouponCriteria } from "@ring/shared/enums/coupon";
import { CouponType } from "@ring/shared/models/couponType";
import { Instruction, Message } from "@ring/ui/Components";
import { trackWindowScroll } from "react-lazy-load-image-component";
import { compact } from "lodash-es";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import Loyalty from "@mui/icons-material/Loyalty";
import SaveAlt from "@mui/icons-material/SaveAlt";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import CouponItem from "./CouponItem";
import styled from "@emotion/styled";
import useCoupon from "../../hooks/useCoupon";

//#region styled
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const DetailTitle = styled.h4`
  margin: 10px 0;
  font-size: 17px;
  font-weight: 600;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin: 5px 0 5px 10px;
  }
`;

const CouponContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(3)}`};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => `${theme.spacing(0)} ${theme.spacing(1)}`};
  }
`;

const InputContainer = styled.div`
  display: flex;
`;

const CouponsContainer = styled.div``;

const Showmore = styled.div`
  font-size: 14px;
  font-weight: 500;
  padding-top: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.vars.palette.info.main};
  cursor: pointer;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-top: 0;
  }
`;
//#endregion

const defaultSize = 4;
const DEFAULT_PAGINATON = {
  number: 0,
  size: defaultSize,
  totalPages: 0,
  isMore: true,
};

const CouponDialog = ({
  numSelected,
  selectMode = false,
  loggedIn,
  shopId,
  checkState,
  open,
  selectedCoupon,
  handleClose,
  onSubmit,
  scrollPosition,
}) => {
  const { coupons: savedCodes } = useCoupon();
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const inputRef = useRef(null);
  const [couponInput, setCouponInput] = useState("");
  const [currCoupon, setCurrCoupon] = useState(selectedCoupon);
  const [tempCoupon, setTempCoupon] = useState(selectedCoupon);
  const [isSaved, setIsSaved] = useState(false);
  const [shipPagination, setShipPagination] = useState(DEFAULT_PAGINATON);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATON);
  const [savedPagination, setSavedPagination] = useState(DEFAULT_PAGINATON);

  // Fetch coupons
  const {
    data: shipping,
    currentData: currentShipping,
    isLoading: loadShipping,
    isFetching: fetchShipping,
    isSuccess: doneShipping,
    isError: errorShipping,
  } = useGetCouponsQuery(
    {
      shopId,
      types: [CouponType.SHIPPING],
      byShop: shopId != null,
      cValue: checkState?.value,
      cQuantity: checkState?.quantity,
      size: shipPagination.size,
      page: shipPagination.number,
      loadMore: shipPagination.isMore,
    },
    { skip: (!shopId && !selectMode) || isSaved }
  );
  const { data, currentData, isLoading, isFetching, isSuccess, isError } =
    useGetCouponsQuery(
      {
        shopId,
        types: [CouponType.PRODUCT],
        byShop: shopId != null,
        cValue: checkState?.value,
        cQuantity: checkState?.quantity,
        size: pagination.size,
        page: pagination.number,
        loadMore: pagination.isMore,
      },
      { skip: (!shopId && !selectMode) || isSaved }
    );
  const {
    data: saved,
    currentData: currentSaved,
    isLoading: loadSaved,
    isFetching: fetchSaved,
    isSuccess: doneSaved,
    isError: errorSaved,
  } = useGetCouponsQuery(
    {
      codes: savedCodes,
      shopId,
      byShop: shopId != null,
      cValue: checkState?.value,
      cQuantity: checkState?.quantity,
      size: savedPagination.size,
      page: savedPagination.number,
      loadMore: savedPagination.isMore,
    },
    { skip: !isSaved && !selectMode && savedCodes?.length > 0 }
  );

  // Fetch coupon by code
  const {
    data: code,
    isLoading: loadCode,
    isSuccess: doneCode,
    isError: errorCode,
  } = useGetCouponQuery(
    {
      code: couponInput,
      shopId: shopId,
      cValue: checkState?.value,
      cQuantity: checkState?.quantity,
    },
    { skip: !couponInput || !selectMode }
  );

  // Reset stuff
  useEffect(() => {
    setCouponInput("");
    setCurrCoupon(selectedCoupon);
    setTempCoupon(selectedCoupon);
  }, [shopId, selectedCoupon]);

  // Update selected/input coupon
  useEffect(() => {
    if (couponInput && doneCode && !loadCode && code) {
      setTempCoupon(code);
      if (code?.shopId == shopId) setCurrCoupon(code);
    }
  }, [code, loadCode, selectedCoupon]);

  useEffect(() => {
    if (data && !isLoading && isSuccess) {
      setPagination({
        ...pagination,
        number: data.page,
        totalPages: data.totalPages,
      });
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (shipping && !loadShipping && doneShipping) {
      setShipPagination({
        ...shipPagination,
        number: shipping.page,
        totalPages: shipping.totalPages,
      });
    }
  }, [shipping]);

  useEffect(() => {
    if (saved && !loadSaved && doneSaved) {
      setSavedPagination({
        ...savedPagination,
        number: saved.page,
        totalPages: saved.totalPages,
      });
    }
  }, [saved]);

  const handleChangeInput = () => {
    setCouponInput(inputRef?.current?.value);
  };
  const handleClickApply = (coupon, shopId) => {
    if (onSubmit) onSubmit(coupon, shopId);
    onClose();
  };

  const handleShowMoreShipping = () => {
    if (
      fetchShipping ||
      typeof shipping?.page !== "number" ||
      shipping?.page < shipPagination?.number
    )
      return;
    const nextPage = shipping?.page + 1;
    if (nextPage < shipping?.totalPages)
      setShipPagination((prev) => ({ ...prev, number: nextPage }));
  };

  const handleShowMore = () => {
    if (
      isFetching ||
      typeof data?.page !== "number" ||
      data?.page < pagination?.number
    )
      return;
    const nextPage = data?.page + 1;
    if (nextPage < data?.totalPages)
      setPagination((prev) => ({ ...prev, number: nextPage }));
  };

  const handleShowMoreSaved = () => {
    if (
      fetchSaved ||
      typeof saved?.page !== "number" ||
      saved?.page < savedPagination?.number
    )
      return;
    const nextPage = saved?.page + 1;
    if (nextPage < saved?.totalPages)
      setSavedPagination((prev) => ({ ...prev, number: nextPage }));
  };

  const toggleSaved = () => {
    setIsSaved((prev) => !prev);
  };

  const onClose = () => {
    handleClose();
    setPagination(DEFAULT_PAGINATON);
    setShipPagination(DEFAULT_PAGINATON);
    setSavedPagination(DEFAULT_PAGINATON);
  };

  const checkDisabled = (coupon) =>
    selectMode && (!loggedIn || !coupon?.isUsable || coupon?.shopId != shopId);

  // Display contents
  let coupons;
  let shippingCoupons;
  let savedCoupons;
  let loadingComponent = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height={{ xs: 85, sm: 155 }}
    >
      <CircularProgress color="primary" />
    </Box>
  );

  if (doneShipping && currentShipping) {
    const { ids, entities } = currentShipping;

    let content = [];

    if (currCoupon && currCoupon?.type == CouponType.SHIPPING) {
      const meta = getCouponType(currCoupon?.type);
      const criteria = getCouponCriteria(currCoupon?.criteria);

      content.push(
        <CouponItem
          key={`coupon-${currCoupon?.id}`}
          {...{
            coupon: currCoupon,
            meta,
            criteria,
            selectMode,
            isDisabled: checkDisabled(currCoupon),
            isSelected: tempCoupon?.id == currCoupon?.id,
            isUsed: selectMode && currCoupon?.isUsed,
            isSaved: savedCodes?.indexOf(currCoupon?.code) != -1,
            onClickApply: setTempCoupon,
          }}
        />
      );
    }

    let fetchContent = ids?.length
      ? ids?.map((id, index) => {
          if (id != currCoupon?.id) {
            const coupon = entities[id];
            const meta = getCouponType(coupon?.type);
            const criteria = getCouponCriteria(coupon?.criteria);
            const isDisabled = checkDisabled(coupon);
            const isUsed = selectMode && coupon?.isUsed;
            const isSelected = tempCoupon?.id == id;
            const isSaved = savedCodes?.indexOf(coupon?.code) != -1;

            return (
              <CouponItem
                key={`coupon-${id}-${index}`}
                {...{
                  coupon,
                  meta,
                  criteria,
                  selectMode,
                  isDisabled,
                  isSelected,
                  isUsed,
                  isSaved,
                  onClickApply: setTempCoupon,
                  scrollPosition,
                }}
              />
            );
          }
        })
      : [];

    content = content.concat(fetchContent);
    content = compact(content); // Removes undefined

    shippingCoupons = (
      <>
        {content?.length > 0 && <DetailTitle>Mã vận chuyển</DetailTitle>}
        {content}
      </>
    );
  }

  if (isSuccess && currentData) {
    const { ids, entities } = currentData;

    let content = [];

    if (currCoupon && currCoupon?.type != CouponType.SHIPPING) {
      const meta = getCouponType(currCoupon?.type);
      const criteria = getCouponCriteria(currCoupon?.criteria);

      content.push(
        <CouponItem
          key={`coupon-${currCoupon?.id}`}
          {...{
            coupon: currCoupon,
            meta,
            criteria,
            selectMode,
            isDisabled: checkDisabled(currCoupon),
            isSelected: tempCoupon?.id == currCoupon?.id,
            isUsed: selectMode && currCoupon?.isUsed,
            isSaved: savedCodes?.indexOf(currCoupon?.code) != -1,
            onClickApply: setTempCoupon,
          }}
        />
      );
    }

    let fetchContent = ids?.length
      ? ids?.map((id, index) => {
          if (id != currCoupon?.id) {
            const coupon = entities[id];
            const meta = getCouponType(coupon?.type);
            const criteria = getCouponCriteria(coupon?.criteria);
            const isDisabled = checkDisabled(coupon);
            const isUsed = selectMode && coupon?.isUsed;
            const isSelected = tempCoupon?.id == id;
            const isSaved = savedCodes?.indexOf(coupon?.code) != -1;

            return (
              <CouponItem
                key={`coupon-${id}-${index}`}
                {...{
                  coupon,
                  meta,
                  criteria,
                  selectMode,
                  isDisabled,
                  isSelected,
                  isUsed,
                  isSaved,
                  onClickApply: setTempCoupon,
                }}
              />
            );
          }
        })
      : [];

    content = content.concat(fetchContent);
    content = compact(content); // Removes undefined

    coupons = (
      <>
        {content?.length > 0 && <DetailTitle>Mã giảm giá</DetailTitle>}
        {content}
      </>
    );
  }

  if (doneSaved && currentSaved) {
    const { ids, entities } = currentSaved;

    let content = ids?.length
      ? ids?.map((id, index) => {
          if (id != currCoupon?.id) {
            const coupon = entities[id];
            const meta = getCouponType(coupon?.type);
            const criteria = getCouponCriteria(coupon?.criteria);
            const isDisabled = checkDisabled(coupon);
            const isUsed = selectMode && tempCoupon?.isUsed;
            const isSelected = tempCoupon?.id == id;
            const isSaved = savedCodes?.indexOf(coupon?.code) != -1;

            return (
              <CouponItem
                key={`coupon-${id}-${index}`}
                {...{
                  coupon,
                  meta,
                  criteria,
                  selectMode,
                  isDisabled,
                  isSelected,
                  isUsed,
                  isSaved,
                  onClickApply: setTempCoupon,
                }}
              />
            );
          }
        })
      : [];

    content = compact(content); // Removes undefined

    savedCoupons = (
      <>
        {content?.length > 0 && <DetailTitle>Mã đã lưu</DetailTitle>}
        {content}
      </>
    );
  }

  return (
    <Dialog
      open={open}
      aria-hidden={!open}
      scroll={"paper"}
      maxWidth={"sm"}
      fullWidth
      onClose={onClose}
      fullScreen={fullScreen}
      closeAfterTransition={false}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <TitleContainer>
          <Loyalty />
          &nbsp;Thông tin ưu đãi
        </TitleContainer>
        {selectMode && (
          <Button
            size="small"
            color={isSaved ? "" : "warning"}
            startIcon={isSaved ? <KeyboardArrowLeft /> : <SaveAlt />}
            onClick={toggleSaved}
          >
            {isSaved ? "Trở về" : "Đã lưu"}
          </Button>
        )}
      </DialogTitle>
      {selectMode && (
        <CouponContainer>
          <InputContainer>
            <TextField
              placeholder="Nhập mã giảm giá"
              type="text"
              id="coupon"
              inputRef={inputRef}
              error={errorCode}
              size="small"
              fullWidth
              disabled={!numSelected || !loggedIn}
              slotProps={{
                input: {
                  startAdornment: (
                    <LocalActivityOutlined
                      style={{ color: "gray", marginRight: "5px" }}
                    />
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              sx={{ width: 125, ml: 1, boxShadow: "none" }}
              disabled={!numSelected || !loggedIn}
              onClick={handleChangeInput}
            >
              Áp dụng
            </Button>
          </InputContainer>
          <Instruction>
            {errorCode
              ? "Mã không hợp lệ"
              : !loggedIn
                ? "Vui lòng đăng nhập để áp dụng mã"
                : !numSelected
                  ? "Vui lòng chọn sản phẩm để sử dụng mã"
                  : ""}
          </Instruction>
          {couponInput && code && (
            <CouponItem
              key={`top-coupon-${code?.id}`}
              {...{
                coupon: code,
                meta: getCouponType(code?.type),
                criteria: getCouponCriteria(code?.criteria),
                selectMode,
                isDisabled: checkDisabled(code),
                isUsed: selectMode && code?.isUsed,
                isSelected: tempCoupon?.id == code?.id,
                onClickApply: setTempCoupon,
              }}
            />
          )}
        </CouponContainer>
      )}
      <DialogContent sx={{ pt: 0, px: { xs: 1, sm: 3 }, height: "100dvh" }}>
        <CouponsContainer>
          {isSaved ? (
            <>
              {savedCoupons}
              {!loadSaved &&
                savedPagination.totalPages > savedPagination.number + 1 && (
                  <Showmore onClick={handleShowMoreSaved}>
                    Xem thêm
                    <ExpandMore />
                  </Showmore>
                )}
              {fetchSaved && loadingComponent}
            </>
          ) : (
            <>
              {shippingCoupons}
              {!loadShipping &&
                shipPagination.totalPages > shipPagination.number + 1 && (
                  <Showmore onClick={handleShowMoreShipping}>
                    Xem thêm
                    <ExpandMore />
                  </Showmore>
                )}
              {coupons}
              {!isLoading && pagination.totalPages > pagination.number + 1 && (
                <Showmore onClick={handleShowMore}>
                  Xem thêm
                  <ExpandMore />
                </Showmore>
              )}
              {(isFetching || fetchShipping) && loadingComponent}
            </>
          )}
          {((isSaved && !savedCoupons && !fetchSaved) ||
            (!isSaved &&
              !coupons &&
              !shippingCoupons &&
              !isFetching &&
              !fetchShipping)) && (
            <Message>
              {isError || errorShipping || errorSaved
                ? "Đã xảy ra lỗi!"
                : "Hiện không có khuyến mãi"}
            </Message>
          )}
        </CouponsContainer>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="error"
          size="large"
          sx={{ marginY: "10px" }}
          startIcon={<Close />}
          onClick={onClose}
        >
          Đóng
        </Button>
        {selectMode && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ marginY: "10px" }}
            startIcon={<Check />}
            onClick={() => handleClickApply(tempCoupon, shopId)}
          >
            Chọn
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default trackWindowScroll(CouponDialog);
