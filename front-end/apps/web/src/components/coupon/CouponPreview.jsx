import styled from "@emotion/styled";
import { lazy, Suspense, useState } from "react";
import { useGetCouponsQuery } from "../../features/coupons/couponsApiSlice";
import { iconList } from "@ring/shared/utils/icon";
import { getCouponCriteria, getCouponType } from "@ring/shared/enums/coupon";
import { MobileExtendButton } from "@ring/ui/Components";
import { trackWindowScroll } from "react-lazy-load-image-component";
import { useTranslation } from "react-i18next";
import { currencyFormat } from "@ring/shared/utils/convert";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LabelOff from "@mui/icons-material/LabelOff";
import Skeleton from "@mui/material/Skeleton";
import useCoupon from "../../hooks/useCoupon";

const Popover = lazy(() => import("@mui/material/Popover"));
const CouponItem = lazy(() => import("./CouponItem"));
const CouponDialog = lazy(() => import("./CouponDialog"));

//#region styled
const DetailTitle = styled.h4`
  margin: 10px 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: none;
  }
`;

const CouponWrapper = styled.div`
  position: relative;
`;

const CouponContainer = styled.div`
  position: relative;
  display: flex;
  height: 100%;
`;

const Wrapper = styled.div`
  display: flex;
  padding: 5px 0;
  overflow-x: scroll;
  scroll-behavior: smooth;
  width: 100%;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 2px 0;
  }
`;

const ItemsContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const Coupon = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
  white-space: nowrap;
  margin-right: 8px;
  cursor: pointer;
`;

const CouponIcon = styled.div`
  float: left;
  height: 40px;
  aspect-ratio: 1/1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  border-right: none;
  background-color: ${({ theme, color }) => theme.vars.palette[color]?.light || theme.vars.palette.primary.light};
  color: ${({ theme, color }) => theme.vars.palette[color]?.contrastText || theme.vars.palette.primary.contrastText};

  ${({ theme }) => theme.breakpoints.down("md")} {
    height: 22px;
    color: ${({ theme, color }) => theme.vars.palette[color]?.dark || theme.vars.palette.primary.dark};

    svg {
      font-size: 15px;
    }
  }
`;

const CouponContent = styled.div`
  float: left;
  height: 40px;
  max-width: 130px;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 6px;
  padding: 0 10px;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  border-left: none;

  &::before,
  &::after {
    content: "";
    position: absolute;
    background-color: ${({ theme }) => theme.vars.palette.background.paper};
    border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
    height: 10px;
    width: 10px;
    border-radius: 100%;
  }

  &::before {
    top: -5px;
    left: -5px;
  }

  &::after {
    bottom: -5px;
    left: -5px;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    height: 22px;
    max-width: 120px;

    &::before,
    &::after {
      height: 6px;
      width: 6px;

      &::before {
        top: -3px;
        left: -3px;
      }

      &::after {
        bottom: -3px;
        left: -3px;
      }
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    &::before,
    &::after {
      display: none;
    }
  }
`;

const CouponTitle = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-weight: 450;
  font-size: 14px;

  ${({ theme }) => theme.breakpoints.down("md")} {
    font-size: 12px;
    font-weight: 350;
    text-transform: uppercase;
  }
`;

const MoreButton = styled.span`
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: end;
  color: ${({ theme, disabled }) => (disabled ? theme.vars.palette.text.disabled : theme.vars.palette.info.main)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "all")};
  cursor: pointer;
`;

const CouponMessage = styled.span`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.vars.palette.text.secondary};

  ${({ theme }) => theme.breakpoints.down("md")} {
    font-size: 14px;
  }
`;
//#endregion

const defaultSize = 4;

const CouponPreview = ({ shopId, scrollPosition }) => {
  const { t } = useTranslation();
  const { coupons: savedCoupons } = useCoupon();
  const { data, isLoading, isSuccess, isError } = useGetCouponsQuery({ shopId, size: defaultSize }, { skip: !shopId });
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [contextCoupon, setContextCoupon] = useState(null);
  const [openDialog, setOpenDialog] = useState(undefined);

  const handlePopover = (e, coupon) => {
    setAnchorEl(e.currentTarget);
    setContextCoupon(coupon);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setContextCoupon(null);
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  let coupons;

  if (isLoading || isError) {
    coupons = [...Array(3)].map((item, index) => (
      <Skeleton
        key={`cate-${index}`}
        variant="rectangular"
        sx={{
          mx: "3px",
          borderRadius: "5px",
          height: { xs: 22, md: 40 },
          width: "30%",
        }}
      />
    ));
  } else if (isSuccess) {
    const { ids, entities } = data;

    coupons = ids?.length ? (
      ids?.map((id, index) => {
        const coupon = entities[id];
        const meta = getCouponType(coupon?.type);
        const criteria = getCouponCriteria(coupon?.criteria);
        const Icon = iconList[meta?.icon];
        const isSaved = savedCoupons?.indexOf(coupon?.code) != -1;
        const couponInfo = { ...coupon, meta, criteria, isSaved };

        return (
          <Coupon
            key={`coupon-${id}-${index}`}
            aria-owns={open ? "mouse-over-popover" : undefined}
            aria-haspopup="true"
            onMouseEnter={(e) => handlePopover(e, couponInfo)}
          >
            <CouponIcon color={meta?.color}>
              <Suspense fallback={null}>
                <Icon />
              </Suspense>
            </CouponIcon>
            <CouponContent>
              <CouponTitle>
                {t(coupon?.discount == 1 ? meta?.summaryFull : meta?.summary, {
                  discount:
                    coupon?.discount == 1 ? currencyFormat.format(coupon?.maxDiscount) : coupon?.discount * 100 + "%",
                  max: currencyFormat.format(coupon?.maxDiscount),
                })}
              </CouponTitle>
            </CouponContent>
          </Coupon>
        );
      })
    ) : (
      <CouponMessage>
        <LabelOff fontSize="small" />
        &nbsp;{t("coupon.empty")}
      </CouponMessage>
    );
  }

  return (
    <CouponWrapper>
      <DetailTitle>
        {t("coupon.sale")}: &nbsp;
        <MoreButton onClick={handleOpenDialog}>
          {t("show.more")}
          <KeyboardArrowRight />
        </MoreButton>
      </DetailTitle>
      <CouponContainer onMouseLeave={handleClose}>
        <Wrapper draggable={true}>
          <ItemsContainer>
            {coupons}
            <Suspense fallback={null}>
              {anchorEl !== undefined && (
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  disableRestoreFocus
                  disableScrollLock
                  sx={{ pointerEvents: "none" }}
                  slotProps={{
                    paper: {
                      elevation: 24,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.32))",
                        backgroundColor: "background.paper",
                        mt: 0.5,
                        padding: 1,
                        borderRadius: 0,
                        pointerEvents: "auto",
                        width: "550px",
                      },
                      onMouseLeave: handleClose,
                    },
                  }}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                  <CouponItem coupon={contextCoupon} scrollPosition={scrollPosition} />
                </Popover>
              )}
            </Suspense>
          </ItemsContainer>
        </Wrapper>
        <MobileExtendButton onClick={handleOpenDialog}>
          <KeyboardArrowRight fontSize="small" />
        </MobileExtendButton>
      </CouponContainer>
      <Suspense fallback={null}>
        {openDialog !== undefined && <CouponDialog {...{ open: openDialog, handleClose: handleCloseDialog, shopId }} />}
      </Suspense>
    </CouponWrapper>
  );
};

export default trackWindowScroll(CouponPreview);
