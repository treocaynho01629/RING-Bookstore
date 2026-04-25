import { MobileExtendButton } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import AssignmentReturn from "@mui/icons-material/AssignmentReturn";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LocalShipping from "@mui/icons-material/LocalShipping";
import VerifiedUser from "@mui/icons-material/VerifiedUser";

//#region styled
const PoliciesWrapper = styled.div`
  position: relative;
`;

const PoliciesContainer = styled.div`
  display: flex;
  overflow: hidden;
  flex-direction: row;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${({ theme }) => theme.breakpoints.down("lg")} {
    flex-direction: column;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    flex-direction: row;
  }
`;

const DetailTitle = styled.h4`
  margin: 10px 0;
  font-weight: 600;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: none;
  }
`;

const PolicyTitle = styled.span`
  font-weight: 450;
  display: flex;
  align-items: center;
  white-space: nowrap;

  &:not(:last-child) {
    margin-right: ${({ theme }) => theme.spacing(2)};
  }

  svg {
    font-size: 18px;
  }

  ${({ theme }) => theme.breakpoints.down("lg")} {
    &:not(:last-child) {
      margin-right: 0;
      margin-bottom: ${({ theme }) => theme.spacing(0.5)};
    }
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin: 3px 0;
    font-size: 14px;
    font-weight: bold;
    padding-right: 20px;

    svg {
      font-size: 16px;
    }
  }
`;
//#endregion

const ProductPolicies = () => {
  const { t } = useTranslation();

  return (
    <PoliciesWrapper>
      <DetailTitle>{t("product.policies.label")}:</DetailTitle>
      <PoliciesContainer>
        <PolicyTitle>
          <LocalShipping color="error" />
          &nbsp;{t("product.policies.shipping")}
        </PolicyTitle>
        <PolicyTitle>
          <AssignmentReturn color="error" />
          &nbsp;{t("product.policies.return")}
        </PolicyTitle>
        <PolicyTitle>
          <VerifiedUser color="error" />
          &nbsp;{t("product.policies.quality")}
        </PolicyTitle>
      </PoliciesContainer>
      <MobileExtendButton>
        <KeyboardArrowRight fontSize="small" />
      </MobileExtendButton>
    </PoliciesWrapper>
    // TODO: Add drawer for policies
  );
};

export default ProductPolicies;
