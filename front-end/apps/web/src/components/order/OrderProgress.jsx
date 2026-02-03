import styled from "@emotion/styled";
import { useState } from "react";
import { StatusContent, ToggleArrow } from "../custom/OrderComponents";
import { stepConnectorClasses } from "@mui/material/StepConnector";
import { useTranslation } from "react-i18next";
import { stepLabelClasses } from "@mui/material/StepLabel";
import { OrderStatus } from "@ring/shared/models/orderStatus";
import { timeFormatter, dateFormatter, currencyFormat } from "@ring/shared/utils/convert";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import Step from "@mui/material/Step";
import StepConnector from "@mui/material/StepConnector";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import AssignmentReturnOutlined from "@mui/icons-material/AssignmentReturnOutlined";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import PublishedWithChanges from "@mui/icons-material/PublishedWithChanges";
import ReceiptOutlined from "@mui/icons-material/ReceiptOutlined";
import SaveAltOutlined from "@mui/icons-material/SaveAltOutlined";
import StarBorder from "@mui/icons-material/StarBorder";
import PropTypes from "prop-types";

//#region styled
const DateText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  margin: ${({ theme }) => theme.spacing(0.5)} 0 0;

  p {
    margin: 0;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: flex;
  }
`;

const StepperContainer = styled.div`
  background-color: ${({ theme, color }) =>
    `color-mix(in srgb, ${theme.vars.palette[color]?.light || theme.vars.palette.primary.light}, 
      transparent 70%)`};
  border: 0.5px solid ${({ theme, color }) => theme.vars.palette[color]?.light ?? theme.vars.palette.primary.light};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  margin-bottom: ${({ theme }) => theme.spacing(1)};

  ${({ theme }) => theme.breakpoints.down("md")} {
    background-color: transparent;
    border-top: none;
    border-color: ${({ theme }) => theme.vars.palette.divider};
    padding: ${({ theme }) => theme.spacing(1.5, 2.5)};
    margin: 0;
  }
`;

const StyledStepConnector = styled(StepConnector)(({ theme, color }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 26,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(to right, 
        hsl(from ${theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main} calc(h - 30) s l),
        ${theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main} 80%, 
        ${theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main})`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(to right, 
          hsl(from ${theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main} calc(h - 30) s l),
        ${theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main} 80%, 
        ${theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main})`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.vars.palette.grey[300],
    borderRadius: 1,
    ...theme.applyStyles("dark", {
      backgroundColor: theme.vars.palette.grey[700],
    }),
  },

  [theme.breakpoints.down("md")]: {
    [`& .${stepConnectorClasses.line}`]: {
      width: 3,
      transform: "scaleY(3)",
    },
    [`&.${stepConnectorClasses.vertical}`]: {
      height: 5,
      marginLeft: 18,
    },
  },
}));

const StyledStepIconRoot = styled("div")(({ theme, color, ownerState }) => ({
  zIndex: 1,
  width: 54,
  height: 54,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  border: "3.5px solid",
  borderColor:
    ownerState.active || ownerState.completed
      ? (theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main)
      : theme.vars.palette.grey[300],
  color:
    ownerState.active || ownerState.completed
      ? (theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main)
      : theme.vars.palette.text.disabled,
  backgroundColor: theme.vars.palette.background.default,
  alignItems: "center",
  ...theme.applyStyles("dark", {
    borderColor:
      ownerState.active || ownerState.completed
        ? (theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main)
        : theme.vars.palette.grey[700],
  }),

  [theme.breakpoints.down("md")]: {
    width: 38,
    height: 38,
    marginRight: theme.spacing(1.5),
  },
}));

const StyledStepLabel = styled(StepLabel)`
  ${({ theme }) => theme.breakpoints.down("md")} {
    .${stepLabelClasses.label} {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
`;

const LabelCheck = styled.span`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${({ theme, color }) =>
    `color-mix(in srgb, ${theme.vars.palette[color]?.light || theme.vars.palette.primary.light}, 
      transparent 70%)`};
  color: ${({ theme, color }) => theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main};

  svg {
    font-size: 16px;
  }

  ${({ theme }) => theme.breakpoints.up("md")} {
    display: none;
  }
`;

const SummaryIcon = styled.span`
  svg {
    font-size: 35px;
  }
`;
//#endregion

function StyledStepIcon(props) {
  const { active, completed, className, color, icon } = props;

  return (
    <StyledStepIconRoot ownerState={{ completed, active }} className={className} color={color}>
      {icon}
    </StyledStepIconRoot>
  );
}

StyledStepIcon.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  completed: PropTypes.bool,
  icon: PropTypes.node,
};

const steps = [
  { label: "checkout.order", icon: <ReceiptOutlined /> },
  { label: "order.pay", icon: <PaymentsOutlined /> },
  { label: "checkout.shipping.label", icon: <LocalShippingOutlined /> },
  { label: "order.receive", icon: <SaveAltOutlined /> },
  { label: "order.completed", icon: <StarBorder /> },
];
const refundSteps = [
  { label: "checkout.order", icon: <ReceiptOutlined /> },
  { label: "order.completed", icon: <Check /> },
  { label: "order.pending.return", icon: <LocalShippingOutlined /> },
  { label: "order.pending.check", icon: <PublishedWithChanges /> },
  { label: "order.refunded", icon: <AssignmentReturnOutlined /> },
];
const cancelSteps = [
  { label: "checkout.order", icon: <ReceiptOutlined /> },
  { label: "order.cancelled", icon: <Close /> },
];

const OrderProgress = ({ status, stepContent, detailStatus, orderedDate, date, tabletMode }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  /**
   * Toggle stepper
   */
  const toggleStepper = () => {
    setOpen((prev) => !prev);
  };

  let stepper = (
    <StepperContainer color={detailStatus?.color}>
      <Stepper
        alternativeLabel={!tabletMode}
        connector={<StyledStepConnector color={detailStatus?.color} />}
        activeStep={stepContent?.step}
        orientation={tabletMode ? "vertical" : "horizontal"}
      >
        {(status == OrderStatus.CANCELED
          ? cancelSteps
          : status == OrderStatus.PENDING_REFUND || status === OrderStatus.REFUNDED
            ? refundSteps
            : steps
        ).map((step, index) => (
          <Step key={index}>
            <StyledStepLabel
              slotProps={{
                stepIcon: {
                  color: detailStatus?.color,
                  icon: step.icon,
                },
              }}
              slots={{ stepIcon: StyledStepIcon }}
            >
              <div>
                {t(step.label, { ns: "authenticated" })}
                {index == 0 && (
                  <DateText>
                    <span>{timeFormatter(orderedDate)}&nbsp;</span>
                    <p>{dateFormatter(orderedDate, i18n.language)}</p>
                  </DateText>
                )}
                {index == stepContent?.step && (
                  <DateText>
                    <span>{timeFormatter(date)}&nbsp;</span>
                    <p>{dateFormatter(date, i18n.language)}</p>
                  </DateText>
                )}
              </div>
              {stepContent?.step >= index && (
                <LabelCheck color={detailStatus?.color}>
                  {status == OrderStatus.CANCELED ? (
                    <Close />
                  ) : status == OrderStatus.PENDING_REFUND || status === OrderStatus.REFUNDED ? (
                    <KeyboardReturn />
                  ) : (
                    <Check />
                  )}
                </LabelCheck>
              )}
            </StyledStepLabel>
          </Step>
        ))}
      </Stepper>
    </StepperContainer>
  );

  return (
    <>
      {tabletMode ? (
        <Paper elevation={3} sx={{ width: "90%", mx: "auto", my: 1 }}>
          <StatusContent color={detailStatus?.color} onClick={toggleStepper}>
            <div>
              <Box display="flex" alignItems="center">
                {t(detailStatus?.label)}
                <ToggleArrow>
                  {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                </ToggleArrow>
              </Box>
              <p>
                {t(stepContent?.summary, {
                  ns: "authenticated",
                  date: stepContent?.date
                    ? `${timeFormatter(stepContent?.date, i18n.language)} ${dateFormatter(stepContent?.date, i18n.language)}`
                    : undefined,
                  amount: stepContent?.price ? currencyFormat.format(stepContent?.price) : undefined,
                })}
              </p>
            </div>
            <SummaryIcon>
              {status == OrderStatus.CANCELED
                ? cancelSteps[stepContent?.step]?.icon
                : [OrderStatus.PENDING_RETURN, OrderStatus.PENDING_REFUND, OrderStatus.REFUNDED]?.includes(status)
                  ? refundSteps[stepContent?.step]?.icon
                  : steps[stepContent?.step]?.icon}
            </SummaryIcon>
          </StatusContent>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {stepper}
          </Collapse>
        </Paper>
      ) : (
        <>{stepper}</>
      )}
    </>
  );
};

export default OrderProgress;
