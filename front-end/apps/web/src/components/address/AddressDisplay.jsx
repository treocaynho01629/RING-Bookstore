import { getAddressType } from "@ring/shared/enums/address";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Skeleton from "@mui/material/Skeleton";

//#region styled
const Title = styled.h4`
  margin: ${({ theme }) => theme.spacing(1.5, 1)};
  font-weight: 420;
`;

const AddressDisplayContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  padding: 20px;

  &.error {
    border-color: ${({ theme }) => theme.vars.palette.error.main};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => theme.spacing(1)};
    border-left: none;
    border-right: none;
  }
`;

const UserInfo = styled.b`
  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 13px;
  }
`;

const AddressContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddressContent = styled.div`
  display: flex;
  margin-right: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
`;

const Address = styled.span`
  font-size: 16px;
  line-height: 1.75em;
  margin-top: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.vars.palette.text.secondary};
`;

const AddressTag = styled.span`
  font-size: 12px;
  font-weight: bold;
  margin-right: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.primary.main};
  color: ${({ theme }) => theme.vars.palette.primary.main};

  &.info {
    color: ${({ theme }) => theme.vars.palette.info.main};
    border-color: ${({ theme }) => theme.vars.palette.info.main};
  }
`;
//#endregion

const AddressType = getAddressType();

const AddressDisplay = ({ address, handleOpen, isValid, loadAddress }) => {
  const { t } = useTranslation();
  const fullAddress = [address?.address, address?.detail].join(", ");
  const addressType = address?.type ? AddressType[address.type] : null;

  return (
    <>
      <Title>{t("address.to")}:</Title>
      <AddressDisplayContainer className={!loadAddress && isValid ? "" : !address ? "" : "error"}>
        <AddressContainer>
          {!address && loadAddress ? (
            <>
              <AddressContent>
                <UserInfo>
                  <Skeleton variant="text" width={200} />
                </UserInfo>
              </AddressContent>
              <Address>
                <Skeleton variant="text" width={300} />
              </Address>
            </>
          ) : (
            <>
              <AddressContent>
                <UserInfo>{address?.companyName ?? address?.name}&nbsp;</UserInfo>
                {address?.phone && <UserInfo>{`(+84) ${address.phone}`}</UserInfo>}
              </AddressContent>
              <Address>
                {addressType && <AddressTag className={addressType.color}>{addressType.label}</AddressTag>}
                {fullAddress}
              </Address>
            </>
          )}
        </AddressContainer>
        <Button
          sx={{ display: { xs: "none", sm: "flex" }, whiteSpace: "nowrap" }}
          aria-label="toggle address dialog"
          variant="outlined"
          color={!loadAddress && isValid ? "primary" : !address ? "primary" : "error"}
          disabled={loadAddress}
          onClick={handleOpen}
        >
          {t("edit")}
        </Button>
        <IconButton
          sx={{ mr: -1, display: { xs: "flex", sm: "none" } }}
          aria-label="mobile toggle address dialog"
          onClick={handleOpen}
          color={!loadAddress && isValid ? "primary" : !address ? "primary" : "error"}
          disabled={loadAddress}
          edge="end"
        >
          <KeyboardArrowRight />
        </IconButton>
      </AddressDisplayContainer>
    </>
  );
};

export default AddressDisplay;
