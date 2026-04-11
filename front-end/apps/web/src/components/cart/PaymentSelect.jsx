import styled from "@emotion/styled";
import { Suspense } from "react";
import { PaymentType } from "@ring/shared/models/paymentType";
import { getPaymentType } from "@ring/shared/enums/payment";
import { iconList } from "@ring/shared/utils/icon";
import { useTranslation } from "react-i18next";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import QuestionMark from "@mui/icons-material/QuestionMark";

//#region styled
const StyledForm = styled(FormControlLabel)`
  padding: ${({ theme }) => theme.spacing(1)} 0;
  min-width: 50%;

  .MuiFormControlLabel-label {
    position: relative;
    width: 100%;
  }
`;

const FormContent = styled.div`
  width: 100%;
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;

  svg {
    font-size: 24px;
    margin-right: ${({ theme }) => theme.spacing(0.5)};
  }
`;

const Description = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
`;

const RadioContainer = styled.div`
  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 0 ${({ theme }) => theme.spacing(1)};
  }
`;

const PaymentContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(1, 0, 3)};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => theme.spacing(1)};
  }
`;

const Title = styled.h4`
  margin: ${({ theme }) => theme.spacing(1.5)} 0;
  margin-top: 0;
  font-weight: 420;
`;
//#endregion

const PaymentSelect = ({ value, handleChange }) => {
  const { t } = useTranslation();
  const meta = getPaymentType(value);

  return (
    <>
      <RadioContainer>
        <RadioGroup spacing={1} row value={value} onChange={handleChange}>
          {Object.values(PaymentType).map((type, index) => {
            const itemMeta = getPaymentType(type);
            const Icon = iconList[itemMeta?.icon] ?? <QuestionMark />;

            return (
              <StyledForm
                key={index}
                sx={{ width: "100%" }}
                value={type}
                control={<Radio />}
                label={
                  <FormContent>
                    <ItemTitle>
                      <Suspense fallback={<QuestionMark />}>
                        <Icon />
                      </Suspense>
                      {t(itemMeta?.label)}
                    </ItemTitle>
                    <Description>{t(itemMeta?.description)}</Description>
                  </FormContent>
                }
              />
            );
          })}
        </RadioGroup>
      </RadioContainer>
      <PaymentContainer>
        <Title>{t(meta?.label)}</Title>
        <Description>{t(meta?.summary)}</Description>
      </PaymentContainer>
    </>
  );
};

export default PaymentSelect;
