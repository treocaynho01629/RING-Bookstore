import styled from "@emotion/styled";
import { useLocation, useNavigate } from "react-router";
import { MobileExtendButton } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import { currencyFormat } from "@ring/shared/utils/convert";
import useAuth from "../../hooks/useAuth";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import Box from "@mui/material/Box";

//#region styled
const PreviewWrapper = styled.div`
  position: relative;
  margin: 20px 0;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin: 0;
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DetailTitle = styled.h4`
  margin: 10px 0;
  font-size: 16px;
  font-weight: 600;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: none;
  }
`;

const Address = styled.span`
  text-decoration: underline;
  font-weight: 450;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AddressInfo = styled.span`
  font-size: 14px;
  display: flex;
  white-space: nowrap;
  cursor: pointer;

  ${({ theme }) => theme.breakpoints.down("md")} {
    overflow: hidden;
    text-overflow: ellipsis;
    align-items: center;
    width: 100%;

    &.hide-on-mobile {
      display: none;
    }
  }
`;
//#endregion

const AddressPreview = ({ addressInfo, handleOpen, loadAddress }) => {
  const { username } = useAuth();
  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  const fullAddress = [addressInfo?.city, addressInfo?.address].join(", ");

  /**
   * Handle click open address dialog
   */
  const handleClickOpen = () => {
    if (!username) {
      navigate("/auth/login", { state: { from: location } });
    } else if (handleOpen) {
      handleOpen();
    }
  };

  return (
    <PreviewWrapper>
      <DetailTitle>{t("shipping.label")}:</DetailTitle>
      <PreviewContainer>
        <Box display="flex" flexDirection={"column"} position="relative" width="100%">
          {!addressInfo && loadAddress ? (
            <Box>{t("updating")}</Box>
          ) : (
            <Box display="flex" width={{ xs: "95%", md: "100%" }}>
              <LocalShippingOutlined />
              <Box overflow="hidden">
                <AddressInfo aria-label="toggle address dialog" disabled={loadAddress} onClick={handleClickOpen}>
                  &nbsp;{t("shipping.label")}:&emsp;
                  <Address>
                    {/* TODO: Do something with this */}
                    {fullAddress.length > 2 ? fullAddress : t("unknown")}
                  </Address>
                  <KeyboardArrowDown sx={{ display: { xs: "none", md: "block" } }} />
                </AddressInfo>
                <AddressInfo className="hide-on-mobile">
                  &nbsp;{t("cart.shipping.fee")}:&emsp;
                  <Address>{currencyFormat.format(10000)}</Address>
                </AddressInfo>
              </Box>
            </Box>
          )}
        </Box>
        <MobileExtendButton disabled={loadAddress} onClick={handleOpen}>
          <KeyboardArrowRight fontSize="small" />
        </MobileExtendButton>
      </PreviewContainer>
    </PreviewWrapper>
  );
};

export default AddressPreview;
