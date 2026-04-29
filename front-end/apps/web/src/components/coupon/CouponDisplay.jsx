import styled from "@emotion/styled";
import { getCouponType } from "@ring/shared/enums/coupon";
import { currencyFormat } from "@ring/shared/utils/convert";
import { iconList } from "@ring/shared/utils/icon";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import QuestionMark from "@mui/icons-material/QuestionMark";

//#region styled
const CouponContainer = styled.div`
  position: relative;
  border-radius: 5px;
  width: 100%;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  box-shadow: ${({ theme }) => theme.shadows[1]};
  display: flex;
  align-items: center;
  margin: 10px 0;

  &::before,
  &::after {
    content: "";
    position: absolute;
    background-color: ${({ theme }) => theme.vars.palette.background.paper};
    border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
    background-image: ${({ theme }) => theme.shadows[3]};
    border-left: none;
    border-bottom: none;
    width: 10px;
    height: 10px;
    border-radius: 100%;
    left: 60px;
    z-index: 1;
  }

  &:after {
    top: -5px;
    transform: rotate(135deg);
  }

  &:before {
    bottom: -5px;
    transform: rotate(-45deg);
  }

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    margin: 0;

    &::before,
    &::after {
      left: 35px;
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    background-color: transparent;
    box-shadow: none;
    border: none;

    &::before,
    &::after {
      display: none;
    }
  }
`;

const CouponIcon = styled.div`
  height: 50px;
  aspect-ratio: 1/1;
  background-color: ${({ theme, color }) => theme.vars.palette[color]?.light || theme.vars.palette.primary.light};
  color: ${({ theme, color }) => theme.vars.palette[color]?.contrastText || theme.vars.palette.primary.contrastText};
  border-right: 5px dotted ${({ theme }) => theme.vars.palette.background.paper};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 10px;
  border-radius: 5px;

  &.disabled {
    filter: grayscale(1);
  }

  svg {
    font-size: 30px;
  }

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    width: 30px;
    height: 30px;
    margin: 5px;
    border-right-width: 3px;

    svg {
      font-size: 17px;
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: 22px;
    height: 22px;
    margin: 0;
    border-right: none;
    border-radius: 6px;
    border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
    color: ${({ theme, color }) => theme.vars.palette[color]?.dark || theme.vars.palette.primary.dark};

    svg {
      font-size: 15px;
    }
  }
`;

const CouponDesc = styled.b`
  position: relative;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 450;
  margin-right: 5px;

  @supports (-webkit-line-clamp: 1) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    font-size: 13px;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;
    max-width: 120px;
    border-radius: 6px;
    padding: 0 10px;
    height: 22px;
    border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
    border-left: none;
  }
`;
//#endregion

const CouponDisplay = ({ coupon }) => {
  const { t } = useTranslation();
  const meta = getCouponType(coupon?.type);
  const Icon = iconList[meta?.icon] ?? QuestionMark;

  return (
    <CouponContainer>
      <CouponIcon color={meta?.color} className={coupon?.isUsable ? "" : "disabled"}>
        <Suspense fallback={<QuestionMark />}>
          <Icon />
        </Suspense>
      </CouponIcon>
      <CouponDesc>
        {t(coupon?.discount == 1 ? meta?.summaryFull : meta?.summary, {
          discount: coupon?.discount == 1 ? currencyFormat.format(coupon?.maxDiscount) : coupon?.discount * 100 + "%",
          max: currencyFormat.format(coupon?.maxDiscount),
        })}
      </CouponDesc>
    </CouponContainer>
  );
};

export default CouponDisplay;
