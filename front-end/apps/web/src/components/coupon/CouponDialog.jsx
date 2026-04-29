import { useEffect, useRef, useState } from "react";
import { useGetCouponQuery, useGetCouponsScrollInfiniteQuery } from "../../features/coupons/couponsApiSlice";
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

const DEFAULT_SIZE = 4;

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

  // Fetch coupons
  const {
    data: shipping,
    currentData: currentShipping,
    isLoading: loadShipping,
    isFetchingNextPage: isFetchingNextShipping,
    hasNextPage: hasNextShipping,
    fetchNextPage: fetchNextShipping,
    isSuccess: doneShipping,
    isError: errorShipping,
  } = useGetCouponsScrollInfiniteQuery(
    {
      shopId,
      types: [CouponType.SHIPPING],
      byShop: shopId != null,
      cValue: checkState?.value,
      cQuantity: checkState?.quantity,
      size: DEFAULT_SIZE,
      showUsed: false,
      showExpired: false,
    },
    { skip: (!shopId && !selectMode) || isSaved }
  );
  const { data, currentData, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isSuccess, isError } =
    useGetCouponsScrollInfiniteQuery(
      {
        shopId,
        types: [CouponType.PRODUCT],
        byShop: shopId != null,
        cValue: checkState?.value,
        cQuantity: checkState?.quantity,
        size: DEFAULT_SIZE,
        showUsed: false,
        showExpired: false,
      },
      { skip: (!shopId && !selectMode) || isSaved }
    );
  const {
    data: saved,
    currentData: currentSaved,
    isLoading: loadSaved,
    isFetchingNextPage: isFetchingNextSaved,
    hasNextPage: hasNextSaved,
    fetchNextPage: fetchNextSaved,
    isSuccess: doneSaved,
    isError: errorSaved,
  } = useGetCouponsScrollInfiniteQuery(
    {
      codes: savedCodes,
      shopId,
      byShop: shopId != null,
      cValue: checkState?.value,
      cQuantity: checkState?.quantity,
      size: DEFAULT_SIZE,
      showUsed: true,
      showExpired: true,
    },
    { skip: !isSaved || !selectMode || !savedCodes?.length }
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

  /**
   * Handle change coupon code input
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleChangeInput = (e) => {
    e.preventDefault();
    setCouponInput(inputRef?.current?.value);
  };

  /**
   * Handle click apply coupon
   * @param {Coupon} coupon
   * @param {number} shopId
   */
  const handleClickApply = (coupon, shopId) => {
    if (onSubmit) onSubmit(coupon, shopId);
    onClose();
  };

  /**
   * Handle show more shipping coupons
   */
  const handleShowMoreShipping = () => {
    if (isFetchingNextShipping || !hasNextShipping) return;
    fetchNextShipping();
  };

  /**
   * Handle show more coupons
   */
  const handleShowMore = () => {
    if (isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  };

  /**
   * Handle show more saved coupons
   */
  const handleShowMoreSaved = () => {
    if (isFetchingNextSaved || !hasNextSaved) return;
    fetchNextSaved();
  };

  /**
   * Toggle saved coupons
   */
  const toggleSaved = () => {
    setIsSaved((prev) => !prev);
  };

  /**
   * Handle close dialog
   */
  const onClose = () => {
    handleClose();
  };

  /**
   * Check if coupon is disabled
   * @param {Coupon} coupon
   * @returns {boolean}
   */
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
    const content = currentShipping?.pages?.flatMap((p) => p.content ?? []);
    const ids = content.map((b) => b.id);
    const entities = Object.fromEntries(content.map((b) => [b.id, b]));

    let displayContent = [];

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

      displayContent.push(
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

    displayContent = displayContent.concat(fetchContent);
    displayContent = compact(displayContent); // Removes undefined

    shippingCoupons = (
      <>
        {displayContent?.length > 0 && <DetailTitle>{t("coupon.shipping")}</DetailTitle>}
        {displayContent}
      </>
    );
  }

  if (isSuccess && currentData) {
    const content = currentData?.pages?.flatMap((p) => p.content ?? []);
    const ids = content.map((b) => b.id);
    const entities = Object.fromEntries(content.map((b) => [b.id, b]));

    let displayContent = [];

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

      displayContent.push(
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

    displayContent = displayContent.concat(fetchContent);
    displayContent = compact(displayContent); // Removes undefined

    coupons = (
      <>
        {displayContent?.length > 0 && <DetailTitle>{t("coupon.discount")}</DetailTitle>}
        {displayContent}
      </>
    );
  }

  if (doneSaved && currentSaved) {
    const content = currentSaved?.pages?.flatMap((p) => p.content ?? []);
    const ids = content.map((b) => b.id);
    const entities = Object.fromEntries(content.map((b) => [b.id, b]));

    let displayContent = ids?.length
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

    displayContent = compact(displayContent); // Removes undefined

    savedCoupons = (
      <>
        {displayContent?.length > 0 && <DetailTitle>{t("coupon.saved")}</DetailTitle>}
        {displayContent}
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

  const savedEmpty = isSaved && saved?.pages[0]?.totalElements == 0 && !isFetchingNextSaved;
  const couponsEmpty =
    !isSaved && data?.pages[0]?.totalElements == 0 && shipping?.pages[0]?.totalElements == 0 && !isFetchingNextShipping;
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
                {!loadSaved && hasNextSaved && (
                  <Showmore onClick={handleShowMoreSaved}>
                    {t("show.more")}
                    <ExpandMore />
                  </Showmore>
                )}
                {isFetchingNextSaved && loadingComponent}
              </>
            ) : (
              <>
                {shippingCoupons}
                {!loadShipping && hasNextShipping && (
                  <Showmore onClick={handleShowMoreShipping}>
                    {t("show.more")}
                    <ExpandMore />
                  </Showmore>
                )}
                {coupons}
                {!isLoading && hasNextPage && (
                  <Showmore onClick={handleShowMore}>
                    {t("show.more")}
                    <ExpandMore />
                  </Showmore>
                )}
                {(isFetchingNextPage || isFetchingNextShipping) && loadingComponent}
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
