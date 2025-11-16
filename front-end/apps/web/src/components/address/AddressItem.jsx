import styled from "@emotion/styled";
import { PHONE_REGEX } from "@ring/shared/utils/regex";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import MoreHoriz from "@mui/icons-material/MoreHoriz";

//#region styled
const Wrapper = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

const AddressItemContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2.5)};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => `${theme.spacing(2.5)} ${theme.spacing(1.5)}`};
  }

  &.active {
    border-color: ${({ theme }) => theme.vars.palette.primary.main};
  }
  &.temp {
    border-color: ${({ theme }) => theme.vars.palette.info.dark};
  }
  &.error {
    border-color: ${({ theme }) => theme.vars.palette.error.main};
  }
`;

const AddressTag = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  font-weight: bold;
  font-size: 12px;
  padding: 2px 10px;
  border-right: 0.5px solid;
  border-bottom: 0.5px solid;
  border-color: ${({ theme }) => theme.vars.palette.primary.main};
  color: ${({ theme }) => theme.vars.palette.primary.dark};
  pointer-events: none;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 10px;
    padding: 2px 6px;
  }

  &.temp {
    border-color: ${({ theme }) => theme.vars.palette.info.dark};
    color: ${({ theme }) => theme.vars.palette.info.dark};
  }

  &.error {
    border-color: ${({ theme }) => theme.vars.palette.error.main};
    color: ${({ theme }) => theme.vars.palette.error.dark};
  }
`;

const UserInfo = styled.b`
  display: flex;
  white-space: nowrap;
  margin-right: 16px;
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

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 13px;
  }
`;

const UserAddress = styled.span`
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

const StyledRadio = styled(Radio)(({ theme }) => ({
  "borderRadius": 0,
  "backgroundColor": theme.vars.palette.action.disabled,
  "transition": "all .25s ease",

  "&:hover": {
    backgroundColor: theme.vars.palette.primary.light,
    color: theme.vars.palette.primary.contrastText,
  },

  "&.Mui-checked": {
    "&.MuiRadio-colorPrimary": {
      backgroundColor: theme.vars.palette.primary.main,
      color: theme.vars.palette.primary.contrastText,
    },

    "&.MuiRadio-colorInfo": {
      backgroundColor: theme.vars.palette.info.main,
      color: theme.vars.palette.info.contrastText,
    },

    "&.MuiRadio-colorError": {
      backgroundColor: theme.vars.palette.error.main,
      color: theme.vars.palette.error.contrastText,
    },
  },
}));
//#endregion

const AddressItem = ({ onCheck, addressInfo, handleOpen, handleClick, selectedValue, isTemp }) => {
  const { t } = useTranslation();
  const isValid = () => {
    if (!addressInfo) return false;

    const { name, phone, address, city } = addressInfo;
    let addressSplit = city?.split(", ");
    let ward = addressSplit[addressSplit.length - 1];
    let currCity = "";
    if (addressSplit.length > 1) currCity = addressSplit[0];

    const result = !(!name || !phone || !address || !currCity || !ward || !PHONE_REGEX.test(phone));
    return result;
  };
  const isNotValid = !isValid();
  const isSelected = selectedValue != null && selectedValue == addressInfo?.id;

  return (
    <Wrapper>
      {onCheck && (
        <StyledRadio
          checked={selectedValue == addressInfo?.id}
          onChange={onCheck}
          value={addressInfo?.id}
          color={isNotValid ? "error" : isTemp ? "info" : "primary"}
          name="address-radio-button"
        />
      )}
      <AddressItemContainer
        className={`${isNotValid ? "error" : addressInfo?.isDefault ? "active" : isTemp ? "temp" : ""}`}
      >
        {addressInfo?.isDefault && (
          <AddressTag className={`${isNotValid ? "error" : ""}`}>
            {t("address.default", { ns: "authenticated" })}
          </AddressTag>
        )}
        {isTemp && (
          <AddressTag className={`${isNotValid ? "error" : "temp"}`}>
            {t("address.temp", { ns: "authenticated" })}
          </AddressTag>
        )}
        <Box display="flex" flexDirection={"column"}>
          {!addressInfo ? (
            <>
              <UserInfo>{t("address.default.empty", { ns: "authenticated" })}</UserInfo>
              <UserAddress>{t("address.suggestion", { ns: "authenticated" })}</UserAddress>
            </>
          ) : (
            <>
              <UserInfo>
                {addressInfo?.companyName || addressInfo?.name}&nbsp;
                {addressInfo?.phone && `(+84) ${addressInfo?.phone}`}
              </UserInfo>
              <UserAddress>{[addressInfo?.city, addressInfo?.address].join(", ")}</UserAddress>
            </>
          )}
        </Box>
        <Button
          sx={{
            display: { xs: "none", sm: "flex" },
            flexShrink: 0,
            mt: 2,
          }}
          aria-label="toggle address dialog"
          variant="outlined"
          color={isNotValid ? "error" : isTemp ? "info" : "primary"}
          onClick={() => handleOpen(addressInfo)}
        >
          {t("edit")}
        </Button>
        <IconButton
          sx={{ display: { xs: "flex", sm: "none" }, pr: 0 }}
          aria-label="mobile toggle address dialog"
          onClick={() => handleOpen(addressInfo)}
          color={isNotValid ? "error" : "primary"}
          size="small"
          edge="end"
        >
          <KeyboardArrowRight />
        </IconButton>
        {!addressInfo?.isDefault && !isSelected && (
          <IconButton
            sx={{
              display: { xs: "none", sm: "flex" },
              position: "absolute",
              top: 1,
              right: 2,
            }}
            onClick={(e) => handleClick(e, addressInfo)}
          >
            <MoreHoriz />
          </IconButton>
        )}
      </AddressItemContainer>
    </Wrapper>
  );
};

export default AddressItem;
