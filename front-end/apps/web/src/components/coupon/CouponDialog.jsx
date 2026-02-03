import { useEffect, useRef, useState } from "react";
import { useGetCouponQuery, useGetCouponsQuery } from "../../features/coupons/couponsApiSlice";
import { getCouponType, getCouponCriteria } from "@ring/shared/enums/coupon";
import { CouponType } from "@ring/shared/models/couponType";
import { Instruction, Message } from "@ring/ui/Components";
import { trackWindowScroll } from "react-lazy-load-image-component";
import { compact, capitalize } from "lodash-es";
import { useTranslation } from "react-i18next";
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
import SimpleBar from "simplebar-react";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

//#region styled
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

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
          background-color: ${({ theme }) => theme.vars.palette.divider};
        }
      }
    }
  }
`;

const DetailTitle = styled.h4`
  margin: 5px 0;
  font-size: 17px;
  font-weight: 600;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin: 5px 0 5px 10px;
  }
`;

const CouponContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1, 3, 0)};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => theme.spacing(0, 1, 0)};
  }
`;

const InputContainer = styled.form`
  display: flex;
`;

const CouponsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

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
  const { t } = useTranslation();
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
    isFetching: fetchingShipping,
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
      showUsed: false,
      showExpired: false,
      loadMore: shipPagination.isMore,
    },
    { skip: (!shopId && !selectMode) || isSaved }
  );
  const { data, currentData, isLoading, isFetching, isSuccess, isError } = useGetCouponsQuery(
    {
      shopId,
      types: [CouponType.PRODUCT],
      byShop: shopId != null,
      cValue: checkState?.value,
      cQuantity: checkState?.quantity,
      size: pagination.size,
      page: pagination.number,
      showUsed: false,
      showExpired: false,
      loadMore: pagination.isMore,
    },
    { skip: (!shopId && !selectMode) || isSaved }
  );
  const {
    data: saved,
    currentData: currentSaved,
    isLoading: loadSaved,
    isFetching: fetchingSaved,
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
      showUsed: true,
      showExpired: true,
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

  const handleChangeInput = (e) => {
    e.preventDefault();
    setCouponInput(inputRef?.current?.value);
  };
  const handleClickApply = (coupon, shopId) => {
    if (onSubmit) onSubmit(coupon, shopId);
    onClose();
  };

  const handleShowMoreShipping = () => {
    if (fetchingShipping || typeof shipping?.page !== "number" || shipping?.page < shipPagination?.number) return;
    const nextPage = shipping?.page + 1;
    if (nextPage < shipping?.totalPages) setShipPagination((prev) => ({ ...prev, number: nextPage }));
  };

  const handleShowMore = () => {
    if (isFetching || typeof data?.page !== "number" || data?.page < pagination?.number) return;
    const nextPage = data?.page + 1;
    if (nextPage < data?.totalPages) setPagination((prev) => ({ ...prev, number: nextPage }));
  };

  const handleShowMoreSaved = () => {
    if (fetchingSaved || typeof saved?.page !== "number" || saved?.page < savedPagination?.number) return;
    const nextPage = saved?.page + 1;
    if (nextPage < saved?.totalPages) setSavedPagination((prev) => ({ ...prev, number: nextPage }));
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

  const checkDisabled = (coupon) => selectMode && (!loggedIn || !coupon?.isUsable || coupon?.shopId != shopId);

  // Display contents
  let coupons;
  let shippingCoupons;
  let savedCoupons;
  let loadingComponent = (
    <Box display="flex" justifyContent="center" alignItems="center" height={{ xs: 85, sm: 155 }}>
      <CircularProgress color="primary" />
    </Box>
  );

  if (doneShipping && currentShipping) {
    const { ids, entities } = currentShipping;

    let content = [];

    if (currCoupon && currCoupon?.type == CouponType.SHIPPING) {
      const couponInfo = {
        ...currCoupon,
        isUsed: selectMode && currCoupon?.isUsed,
        isSelected: tempCoupon?.id == currCoupon?.id,
        isSaved: savedCodes?.indexOf(currCoupon?.code) != -1,
        isDisabled: checkDisabled(currCoupon),
        meta: getCouponType(currCoupon?.type),
        criteria: getCouponCriteria(currCoupon?.criteria),
      };

      content.push(
        <CouponItem
          key={`coupon-${currCoupon?.id}`}
          {...{
            coupon: couponInfo,
            selectMode,
            onClickApply: setTempCoupon,
          }}
        />
      );
    }

    let fetchContent = ids?.length
      ? ids?.map((id, index) => {
          if (id != currCoupon?.id) {
            const coupon = entities[id];
            const couponInfo = {
              ...coupon,
              isUsed: selectMode && coupon?.isUsed,
              isSelected: tempCoupon?.id == id,
              isSaved: savedCodes?.indexOf(coupon?.code) != -1,
              isDisabled: checkDisabled(coupon),
              meta: getCouponType(coupon?.type),
              criteria: getCouponCriteria(coupon?.criteria),
            };

            return (
              <CouponItem
                key={`coupon-${id}-${index}`}
                {...{
                  coupon: couponInfo,
                  selectMode,
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
        {content?.length > 0 && <DetailTitle>{t("coupon.shipping")}</DetailTitle>}
        {content}
      </>
    );
  }

  if (isSuccess && currentData) {
    const { ids, entities } = currentData;

    let content = [];

    if (currCoupon && currCoupon?.type != CouponType.SHIPPING) {
      const couponInfo = {
        ...currCoupon,
        isUsed: selectMode && currCoupon?.isUsed,
        isSelected: tempCoupon?.id == currCoupon?.id,
        isSaved: savedCodes?.indexOf(currCoupon?.code) != -1,
        isDisabled: checkDisabled(currCoupon),
        meta: getCouponType(currCoupon?.type),
        criteria: getCouponCriteria(currCoupon?.criteria),
      };

      content.push(
        <CouponItem
          key={`coupon-${currCoupon?.id}`}
          {...{
            coupon: couponInfo,
            selectMode,
            onClickApply: setTempCoupon,
          }}
        />
      );
    }

    let fetchContent = ids?.length
      ? ids?.map((id, index) => {
          if (id != currCoupon?.id) {
            const coupon = entities[id];
            const couponInfo = {
              ...coupon,
              isUsed: selectMode && coupon?.isUsed,
              isSelected: tempCoupon?.id == id,
              isSaved: savedCodes?.indexOf(coupon?.code) != -1,
              isDisabled: checkDisabled(coupon),
              meta: getCouponType(coupon?.type),
              criteria: getCouponCriteria(coupon?.criteria),
            };

            return (
              <CouponItem
                key={`coupon-${id}-${index}`}
                {...{
                  coupon: couponInfo,
                  selectMode,
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
        {content?.length > 0 && <DetailTitle>{t("coupon.discount")}</DetailTitle>}
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
            const couponInfo = {
              ...coupon,
              isUsed: selectMode && coupon?.isUsed,
              isSelected: tempCoupon?.id == id,
              isSaved: savedCodes?.indexOf(coupon?.code) != -1,
              isDisabled: checkDisabled(coupon),
              meta: getCouponType(coupon?.type),
              criteria: getCouponCriteria(coupon?.criteria),
            };

            return (
              <CouponItem
                key={`coupon-${id}-${index}`}
                {...{
                  coupon: couponInfo,
                  selectMode,
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
        {content?.length > 0 && <DetailTitle>{t("coupon.saved")}</DetailTitle>}
        {content}
      </>
    );
  }

  let errorMessage = errorCode
    ? t("coupon.invalid")
    : !loggedIn
      ? capitalize("required.login", { action: t("cart.coupon.apply") })
      : !numSelected
        ? t("required.select")
        : "";

  const savedEmpty = isSaved && saved?.ids?.length == 0 && !fetchingSaved;
  const couponsEmpty =
    !isSaved && data?.ids?.length == 0 && shipping?.ids?.length == 0 && !isFetching && !fetchingShipping;
  const errorFlag = isError || errorShipping || errorSaved;

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
          &nbsp;{t("coupon.title")}
        </TitleContainer>
        {selectMode && (
          <Button
            size="small"
            color={isSaved ? "" : "warning"}
            startIcon={isSaved ? <KeyboardArrowLeft /> : <SaveAlt />}
            onClick={toggleSaved}
          >
            {isSaved ? t("back") : t("saved")}
          </Button>
        )}
      </DialogTitle>
      {selectMode && (
        <CouponContainer>
          <InputContainer onSubmit={handleChangeInput}>
            <TextField
              placeholder={t("coupon.add")}
              type="text"
              id="coupon"
              inputRef={inputRef}
              error={errorCode}
              size="small"
              fullWidth
              disabled={!numSelected || !loggedIn}
              slotProps={{
                input: {
                  startAdornment: <LocalActivityOutlined style={{ color: "gray", marginRight: "5px" }} />,
                },
              }}
            />
            <Button
              variant="contained"
              sx={{ width: 125, ml: 1, boxShadow: "none" }}
              disabled={!numSelected || !loggedIn}
              onClick={handleChangeInput}
            >
              {t("apply")}
            </Button>
          </InputContainer>
          {couponInput && code && (
            <CouponItem
              key={`top-coupon-${code?.id}`}
              {...{
                coupon: {
                  ...code,
                  isUsed: selectMode && code?.isUsed,
                  isSelected: tempCoupon?.id == code?.id,
                  isDisabled: checkDisabled(code),
                  meta: getCouponType(code?.type),
                  criteria: getCouponCriteria(code?.criteria),
                },
                selectMode,
                onClickApply: setTempCoupon,
                style: { marginTop: "8px" },
              }}
            />
          )}
          <Instruction>
            {errorMessage ? (
              <>
                <ErrorOutline fontSize="small" />
                &nbsp;{errorMessage}
              </>
            ) : null}
          </Instruction>
        </CouponContainer>
      )}
      <DialogContent sx={{ height: "100dvh", position: "relative" }} dividers={true}>
        <StyledSimpleBar>
          <CouponsContainer>
            {isSaved ? (
              <>
                {savedCoupons}
                {!loadSaved && savedPagination.totalPages > savedPagination.number + 1 && (
                  <Showmore onClick={handleShowMoreSaved}>
                    {t("show.more")}
                    <ExpandMore />
                  </Showmore>
                )}
                {fetchingSaved && loadingComponent}
              </>
            ) : (
              <>
                {shippingCoupons}
                {!loadShipping && shipPagination.totalPages > shipPagination.number + 1 && (
                  <Showmore onClick={handleShowMoreShipping}>
                    {t("show.more")}
                    <ExpandMore />
                  </Showmore>
                )}
                {coupons}
                {!isLoading && pagination.totalPages > pagination.number + 1 && (
                  <Showmore onClick={handleShowMore}>
                    {t("show.more")}
                    <ExpandMore />
                  </Showmore>
                )}
                {(isFetching || fetchingShipping) && loadingComponent}
              </>
            )}
            {savedEmpty ||
              (couponsEmpty && <Message>{errorFlag ? t("error.general") : t("coupon.not.found")}</Message>)}
          </CouponsContainer>
        </StyledSimpleBar>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" size="large" startIcon={<Close />} onClick={onClose}>
          {t("close")}
        </Button>
        {selectMode && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Check />}
            onClick={() => handleClickApply(tempCoupon, shopId)}
          >
            {t("select")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default trackWindowScroll(CouponDialog);
