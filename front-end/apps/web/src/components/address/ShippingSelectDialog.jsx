import styled from "@emotion/styled";
import { currencyFormat } from "@ring/shared/utils/convert";
import { useTranslation } from "react-i18next";
import { useEffect, useState, forwardRef } from "react";
import { DEFAULT_SHIPPING_TYPE, DEFAULT_SHIPPING_ESTIMATATION } from "@ring/shared/constants/appContants";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import useMediaQuery from "@mui/material/useMediaQuery";
import AllInbox from "@mui/icons-material/AllInbox";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import LocalShipping from "@mui/icons-material/LocalShipping";

//#region styled
const FormContent = styled.div`
  width: 100%;
`;

const StyledForm = styled(FormControlLabel)`
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
  padding-left: 0;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  min-width: 50%;
  margin: ${({ theme }) => theme.spacing(0.5)} 0;

  .MuiFormControlLabel-label {
    position: relative;
    width: 100%;
  }

  &:has(input[type="radio"]:checked) {
    border-color: ${({ theme }) => theme.vars.palette.primary.main};
    background-color: ${({ theme }) =>
      `color-mix(in srgb, ${theme.vars.palette.primary.light}, 
      transparent 90%)`};
  }
`;

const ItemContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

const Discount = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.vars.palette.text.disabled};
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  text-decoration: line-through;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const PriceTag = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-weight: 450;
  color: ${({ theme, color }) => theme.vars.palette[color]?.dark || theme.vars.palette.text.primary};
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;

  svg {
    font-size: 24px;
    margin-right: ${({ theme }) => theme.spacing(0.5)};
  }
`;

const Estimate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
`;
//#endregion

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const ShippingSelectDialog = ({ open, handleClose, selectedShipping, shippingFee, shippingDiscount, onSubmit }) => {
  const { t } = useTranslation();
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [value, setValue] = useState(selectedShipping);

  useEffect(() => {
    setValue(selectedShipping);
  }, [selectedShipping]);

  /**
   * Handle change shipping type
   * @param {Event} e
   */
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <Dialog
      open={open}
      aria-hidden={!open}
      scroll={"paper"}
      maxWidth={"sm"}
      fullWidth
      onClose={handleClose}
      fullScreen={fullScreen}
      closeAfterTransition={false}
      slots={{
        transition: Transition,
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <AllInbox />
        &nbsp;{t("checkout.shipping.select", { ns: "authenticated" })}
      </DialogTitle>
      <DialogContent sx={{ padding: { xs: 1, sm: "20px 24px" } }}>
        <RadioGroup value={value} onChange={handleChange}>
          <StyledForm
            value={DEFAULT_SHIPPING_TYPE}
            control={<Radio />}
            label={
              <FormContent>
                <ItemContent>
                  <ItemTitle>
                    <LocalShipping color="primary" />
                    {t("checkout.shipping.ghn", { ns: "authenticated" })}
                  </ItemTitle>
                  <PriceTag>{shippingFee ? currencyFormat.format(shippingFee) : t("unknown")}</PriceTag>
                </ItemContent>
                <Estimate>
                  {t("checkout.shipping.estimate", { ns: "authenticated", date: DEFAULT_SHIPPING_ESTIMATATION })}
                </Estimate>
              </FormContent>
            }
          />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" size="large" onClick={handleClose} startIcon={<Close />}>
          {t("cancel")}
        </Button>
        <Button variant="contained" color="primary" size="large" onClick={() => onSubmit(value)} startIcon={<Check />}>
          {t("select")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShippingSelectDialog;
