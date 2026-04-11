import styled from "@emotion/styled";
import { useLocation, useNavigate } from "react-router";
import { lazy, useState, Suspense, useEffect } from "react";
import { MobileExtendButton } from "@ring/ui/Components";
import { useTranslation } from "react-i18next";
import { currencyFormat } from "@ring/shared/utils/convert";
import { useGetMyAddressQuery } from "../../features/addresses/addressesApiSlice";
import { useCalculateShippingFeeMutation } from "../../features/orders/ordersApiSlice";
import useAuth from "../../hooks/useAuth";
import useAddress from "../../hooks/useAddress";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

const AddressSelectDialog = lazy(() => import("./AddressSelectDialog"));

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

const AddressPreview = ({ product, pending, setPending }) => {
  const { username } = useAuth();
  const { defaultAddress, setDefaultAddress } = useAddress();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDialog, setOpenDialog] = useState(false);
  const [shippingFee, setShippingFee] = useState(null);

  // Fetch address when not loaded
  const { data: addressData, isLoading: loadAddress } = useGetMyAddressQuery({}, { skip: !username || defaultAddress });
  const [calculateFee, { isLoading: isCalculating }] = useCalculateShippingFeeMutation();

  const fullAddress = [defaultAddress?.address, defaultAddress?.detail].join(", ");

  // Set default address when address data loaded
  useEffect(() => {
    if (!loadAddress && addressData) {
      setDefaultAddress(addressData);
    }
  }, [addressData]);

  // Calculate shipping fee when product and default address changed
  // This will run twice in dev mode
  useEffect(() => {
    if (product && defaultAddress && !isCalculating) {
      calculateFee({
        toDistrictId: defaultAddress?.districtId,
        toWardCode: defaultAddress?.wardCode,
        ghnShopId: product?.ghnShopId,
        weight: product?.weight,
        length: product?.length,
        width: product?.width,
        height: product?.height,
        insuranceValue: product?.price,
      })
        .then((res) => {
          setShippingFee(res.data);
        })
        .catch((err) => {
          console.error(err);
          setShippingFee(-1);
        });
    }
  }, [product, defaultAddress]);

  /**
   * Handle click open address dialog
   */
  const handleClickOpen = () => {
    if (!username) {
      navigate("/auth/login", { state: { from: location } });
    } else if (handleOpenDialog) {
      handleOpenDialog();
    }
  };

  /**
   * Open address select dialog
   */
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  /**
   * Close address select dialog
   */
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <PreviewWrapper>
      <DetailTitle>{t("shipping.label")}:</DetailTitle>
      <PreviewContainer>
        <Box display="flex" flexDirection={"column"} position="relative" width="100%">
          {!defaultAddress && loadAddress ? (
            <Box>{t("updating")}</Box>
          ) : (
            <Box display="flex" width={{ xs: "95%", md: "100%" }}>
              <LocalShippingOutlined />
              <Box overflow="hidden">
                <AddressInfo aria-label="toggle address dialog" disabled={loadAddress} onClick={handleClickOpen}>
                  &nbsp;{t("address.to")}:&emsp;
                  <Address>{fullAddress.length > 2 ? fullAddress : t("address.add")}</Address>
                  <KeyboardArrowDown sx={{ display: { xs: "none", md: "block" } }} />
                </AddressInfo>
                <AddressInfo className="hide-on-mobile">
                  &nbsp;{t("cart.shipping.fee")}:&emsp;
                  <Address>
                    {isCalculating ? (
                      <Skeleton animation="wave" width={100} height={20} />
                    ) : shippingFee >= 0 ? (
                      currencyFormat.format(shippingFee)
                    ) : (
                      t("unknown")
                    )}
                  </Address>
                </AddressInfo>
              </Box>
            </Box>
          )}
        </Box>
        <MobileExtendButton disabled={loadAddress} onClick={handleClickOpen}>
          <KeyboardArrowRight fontSize="small" />
        </MobileExtendButton>
      </PreviewContainer>
      <Suspense fallback={null}>
        <AddressSelectDialog
          {...{
            address: defaultAddress,
            loggedIn: username != null,
            pending,
            setPending,
            setAddress: setDefaultAddress,
            openDialog,
            handleCloseDialog,
          }}
        />
      </Suspense>
    </PreviewWrapper>
  );
};

export default AddressPreview;
