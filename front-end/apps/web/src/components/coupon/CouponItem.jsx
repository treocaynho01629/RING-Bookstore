import styled from "@emotion/styled";
import { currencyFormat, dateFormatter } from "@ring/shared/utils/convert";
import { iconList } from "@ring/shared/utils/icon";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Paper from "@mui/material/Paper";
import Storefront from "@mui/icons-material/Storefront";
import useCoupon from "../../hooks/useCoupon";

//#region styled
const Wrapper = styled.div`
  padding: 5px;
  overflow: hidden;
  position: relative;
  width: 100%;

  &.display {
    padding: 0;
  }
`;

const CouponEdge = styled(Paper)`
  position: absolute;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  border-left: none;
  border-bottom: none;
  width: 30px;
  height: 30px;
  border-radius: 100%;
  box-shadow: none;
  top: calc(50% - 15px);
  z-index: 1;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 20px;
    height: 20px;
    top: calc(50% - 10px);
  }

  &.left {
    left: -12px;
    transform: rotate(45deg);
  }

  &.right {
    right: -12px;
    transform: rotate(-135deg);
  }
`;

const CouponContent = styled.div`
  height: 100%;
  padding: 0 10px;
  position: relative;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 0 5px;
  }
`;

const CouponAction = styled.div`
  height: 100%;
  border: 0.5px dashed ${({ theme }) => theme.vars.palette.primary.main};
  margin: 0 10px 5px;
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;

  &.saved {
    border-color: ${({ theme }) => theme.vars.palette.warning.main};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    position: absolute;
    padding: 0;
    right: 2%;
    bottom: 3%;
    height: 30%;
    margin-right: 4px;
  }
`;

const CouponMain = styled.div`
  position: relative;
  padding-left: 10px;
  height: 80px;
  width: 100%;
  max-width: 75%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  h2 {
    font-size: 15px;
    margin: 0;
    text-transform: uppercase;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;

    @supports (-webkit-line-clamp: 1) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
  }

  p {
    font-size: 14px;
    margin: 5px 0;
    color: ${({ theme }) => theme.vars.palette.text.secondary};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 75px;
    padding-left: ${({ theme }) => theme.spacing(0.5)};

    h2 {
      font-size: 13px;
      text-transform: none;

      @supports (-webkit-line-clamp: 2) {
        -webkit-line-clamp: 2;
      }
    }

    p {
      margin: 0;
      font-size: 13px;
      width: 80%;
    }

    span {
      font-size: 12px;
    }
  }
`;

const Expire = styled.div`
  display: flex;
  width: 80%;
`;

const ExpText = styled.span`
  font-size: 14px;
  margin-right: ${({ theme }) => theme.spacing(1.25)};
  font-weight: 450;
  color: ${({ theme, color }) => theme.vars.palette[color]?.main || theme.vars.palette.text.primary};
  white-space: nowrap;

  &::before {
    content: "Còn:";
  }

  &.date {
    color: ${({ theme }) => theme.vars.palette.info.light};
    font-weight: normal;

    &::before {
      content: "HSD:";
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;

    &::before {
      content: "";
    }
  }
`;

const CouponIcon = styled.div`
  height: 80px;
  aspect-ratio: 1/1;
  background-color: ${({ theme, color }) => theme.vars.palette[color]?.light || theme.vars.palette.primary.light};
  color: ${({ theme, color }) => theme.vars.palette[color]?.contrastText || theme.vars.palette.primary.contrastText};
  border-right: 5px dotted ${({ theme }) => theme.vars.palette.background.default};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px;
  border-radius: 5px;

  svg {
    font-size: 40px;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 75px;
    margin: 5px;
  }
`;

const ShopImage = styled(LazyLoadImage)`
  height: 45px;
  aspect-ratio: 1/1;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.vars.palette.success.main};
`;

const ShopName = styled.span`
  max-width: 90%;
  font-size: 11px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  @supports (-webkit-line-clamp: 1) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
`;

const CouponCode = styled.span`
  position: relative;
  height: 100%;
  flex-grow: 1;
  margin-left: 10px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;

const CouponContainer = styled.div`
  position: relative;
  border-radius: 5px;
  padding: 5px;
  height: 100%;
  background-color: ${({ theme }) => theme.vars.palette.background.default};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  box-shadow: ${({ theme }) => theme.shadows[1]};
  transition: all 0.2s ease;

  &.active {
    background-color: ${({ theme }) =>
      `color-mix(in srgb, ${theme.vars.palette.primary.light}, 
    transparent 90%)`};
    border-color: ${({ theme }) => theme.vars.palette.primary.main};

    ${CouponEdge} {
      border-color: ${({ theme }) => theme.vars.palette.primary.main};
    }

    ${CouponIcon} {
      border-color: transparent;
    }
  }

  &.disabled {
    filter: grayscale(1);

    &::after {
      content: "CHƯA THOẢ ĐIỀU KIỆN";
      position: absolute;
      right: 20px;
      bottom: 20px;
      width: 120px;
      height: 56px;
      font-weight: bold;
      text-align: center;
      display: flex;
      align-items: center;
      background-color: ${({ theme }) => theme.vars.palette.background.default};
      color: ${({ theme }) => theme.vars.palette.text.disabled};
      border: 1px solid ${({ theme }) => theme.vars.palette.divider};
      border-radius: 6px;
      transform: rotate(-10deg);
      pointer-events: none;
    }

    ${CouponAction} {
      pointer-events: none;
    }

    &.active {
      ${CouponAction} {
        pointer-events: all;
      }
    }

    &.used {
      &::after {
        content: "ĐÃ QUA SỬ DỤNG";
      }
    }
  }

  ${({ theme }) => theme.breakpoints.up("md_lg")} {
    &.display {
      padding: 5px 2px;

      ${CouponEdge} {
        width: 20px;
        height: 20px;
        top: calc(50% - 10px);
      }

      ${CouponContent} {
        padding: 0 5px;
      }

      ${CouponAction} {
        position: absolute;
        padding: 0;
        right: 2%;
        bottom: 3%;
        height: 30%;
        margin-right: 4px;
      }

      ${CouponMain} {
        height: 75px;
        padding-left: ${({ theme }) => theme.spacing(0.5)};

        h2 {
          font-size: 14px;
          text-transform: none;

          @supports (-webkit-line-clamp: 2) {
            -webkit-line-clamp: 2;
          }
        }

        p {
          margin: 0;
          font-size: 13px;
          width: 80%;
        }

        span {
          font-size: 12px;
        }
      }

      ${ExpText} {
        font-size: 12px;
        margin-right: ${({ theme }) => theme.spacing(0.5)};

        &::before {
          content: "";
        }
      }

      ${CouponIcon} {
        height: 75px;
        margin: 5px;
      }

      ${CouponCode} {
        display: none;
      }

      &.disabled {
        &::after {
          right: 10px;
          bottom: 10px;
          width: 70px;
          height: 40px;
          font-size: 11px;
        }
      }
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 5px 2px;

    &.disabled {
      &::after {
        right: 10px;
        bottom: 10px;
        width: 70px;
        height: 40px;
        font-size: 11px;
      }
    }
  }
`;
//#endregion

const CouponItem = ({ coupon, selectMode, onClickApply, className, scrollPosition }) => {
  const { t } = useTranslation();
  const { addCoupon, removeCoupon } = useCoupon();
  const date = new Date(coupon?.expDate);
  const warnDate = new Date();
  warnDate.setDate(warnDate.getDate() + 2);
  console.log(coupon);

  /**
   * Handle click apply coupon
   */
  const handleClick = () => {
    coupon?.isSelected ? onClickApply(null) : onClickApply(coupon);
  };

  /**
   * Handle save/remove coupon
   */
  const handleSave = () => {
    coupon?.isSaved ? removeCoupon(coupon?.code) : addCoupon(coupon?.code);
  };

  const Icon = iconList[coupon?.meta?.icon];
  let shopIcon = coupon ? (
    <CouponIcon color={coupon?.meta?.color}>
      {coupon?.shopImage ? (
        <ShopImage
          src={coupon.shopImage}
          alt={`Shop: ${coupon?.shopName}`}
          scrollPosition={scrollPosition}
          placeholder={<Storefront />}
        />
      ) : (
        <Icon />
      )}
      {coupon?.shopName && <ShopName>{coupon?.shopName}</ShopName>}
    </CouponIcon>
  ) : null;

  return (
    <Wrapper className={className}>
      {coupon ? (
        <CouponContainer
          className={`${selectMode && coupon?.isSelected ? "active " : " "}${
            selectMode && coupon?.isUsed ? "disabled used" : coupon?.isDisabled ? "disabled" : className
          }`}
        >
          <CouponEdge elevation={className == "display" ? 0 : 24} className="left" />
          <CouponEdge elevation={className == "display" ? 0 : 24} className="right" />
          <CouponContent>
            <Suspense fallback={null}>
              {coupon?.shopId ? <Link to={`/shop/${coupon?.shopId}`}>{shopIcon}</Link> : shopIcon}
            </Suspense>
            <CouponMain>
              <div>
                <h2>
                  {t(coupon?.discount == 1 ? coupon?.meta?.summaryFull : coupon?.meta?.summary, {
                    discount:
                      coupon?.discount == 1 ? currencyFormat.format(coupon?.maxDiscount) : coupon?.discount * 100 + "%",
                    max: currencyFormat.format(coupon?.maxDiscount),
                  })}
                </h2>
                <p>
                  {t(coupon?.attribute == 0 ? coupon?.criteria?.conditionAll : coupon?.criteria?.condition, {
                    min: coupon?.criteria?.formatter(coupon?.attribute),
                    unit: t(coupon?.criteria?.unit),
                  })}
                </p>
              </div>
              <Expire>
                <ExpText color={date <= warnDate ? "error" : ""} className="date">
                  &nbsp;{dateFormatter(date)}
                </ExpText>
                {coupon?.usage < 100 && <ExpText color="error">&nbsp;{coupon?.usage} lượt</ExpText>}
              </Expire>
            </CouponMain>
          </CouponContent>
          <CouponAction className={coupon?.isSaved ? "saved" : ""}>
            <CouponCode>{coupon?.code}</CouponCode>
            {selectMode ? (
              <Button disableRipple color={coupon?.isSelected ? "error" : "primary"} onClick={handleClick}>
                {coupon?.isSelected ? "Bỏ chọn" : "Áp dụng"}
              </Button>
            ) : (
              <Button disableRipple color={coupon?.isSaved ? "warning" : "primary"} onClick={handleSave}>
                {coupon?.isSaved ? "Gỡ" : "Lưu"}
              </Button>
            )}
          </CouponAction>
        </CouponContainer>
      ) : (
        <Skeleton
          variant="rectangular"
          width="100%"
          sx={{
            margin: "5px 0",
            borderRadius: "5px",
            height: { xs: 85, sm: 155 },
          }}
        />
      )}
    </Wrapper>
  );
};

export default CouponItem;
