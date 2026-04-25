import styled from "@emotion/styled";
import { useMemo, useState } from "react";
import {
  StatusContent,
  ToggleArrow,
  Title,
  Name,
  InfoText,
  MainButton,
  SubText,
  InfoContainer,
  ContentWrapper,
} from "../custom/OrderComponents";
import { stepConnectorClasses } from "@mui/material/StepConnector";
import { useTranslation } from "react-i18next";
import { stepLabelClasses } from "@mui/material/StepLabel";
import {
  GHNReturnStatus,
  GHNTransportStatus,
  GHNPickupStatus,
  GHNCancelStatus,
  GHNFailStatus,
  getGHNStatus,
} from "@ring/shared/enums/ghn";
import { currencyFormat, dateTimeFormatter } from "@ring/shared/utils/convert";
import { OrderStatus } from "@ring/shared/models/orderStatus";
import { useGetGHNOrderDetailQuery } from "../../features/orders/ordersApiSlice";
import { getOrderStatus } from "@ring/shared/enums/order";
import { PaymentStatus } from "@ring/shared/models/paymentStatus";
import Placeholder from "@ring/ui/Placeholder";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Step from "@mui/material/Step";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
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
import Collapse from "@mui/material/Collapse";
import SellIcon from "@mui/icons-material/Sell";

//#region styled
const CollapseContent = styled.div`
  padding: ${({ theme }) => theme.spacing(1)} 0;
  border-bottom: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
`;

const DateText = styled.span`
  font-size: 12px;
  display: block;
  font-weight: 350;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  margin: ${({ theme }) => theme.spacing(0.5, 0, 0)};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;

const StepperContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)} 0;
  margin-bottom: ${({ theme }) => theme.spacing(1)};

  ${({ theme }) => theme.breakpoints.down("md")} {
    background-color: transparent;
    padding: ${({ theme }) => theme.spacing(0, 2, 1, 1)};
    border-bottom: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
  }
`;

const StyledStepLabel = styled(StepLabel)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    [`& .${stepLabelClasses.label}`]: {
      fontSize: 10,
      marginTop: 6,
    },
  },
}));

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

  [`&.${stepConnectorClasses.vertical}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      width: 2,
      marginLeft: -4.5,
      transformOrigin: "top",
      transform: "translateY(-24px) scaleY(2.5)",
    },
  },

  [theme.breakpoints.down("md")]: {
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 12,
    },

    [`& .${stepConnectorClasses.line}`]: {
      height: 2,
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
    "width": 25,
    "height": 25,
    "borderWidth": 2,

    "& svg": {
      fontSize: 15,
    },
  },

  ["&.shipping"]: {
    "borderRadius": "50%",
    "border": `1px solid`,
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",

    ...(ownerState.active || ownerState.completed
      ? {
          width: 22,
          height: 22,
          marginLeft: -2,
          marginRight: -2,
          borderColor: theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main,
          color: theme.vars.palette[color]?.contrastText ?? theme.vars.palette.primary.contrastText,
          backgroundColor: theme.vars.palette[color]?.main ?? theme.vars.palette.primary.main,
        }
      : {
          width: 18,
          height: 18,
          borderColor: theme.vars.palette.text.disabled,
          color: theme.vars.palette.text.disabled,
          backgroundColor: theme.vars.palette.background.paper,
        }),

    "& svg": {
      fontSize: 12,
    },

    "&:empty": {
      width: 14,
      height: 14,
      marginLeft: 1.5,
      marginRight: 2.5,
      border: 0,
      backgroundColor: theme.vars.palette.divider,
    },
  },
}));

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
  border-radius: 50%;
  aspect-ratio: 1/1;
  width: 60px;
  padding: ${({ theme }) => theme.spacing()};
  background-color: ${({ theme }) => theme.vars.palette.action.selected};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 35px;
  }
`;

const ReasonContainer = styled.div`
  border-top: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
  padding-top: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: ${({ theme }) => theme.spacing(0, 1, 1)};
    margin-top: ${({ theme }) => theme.spacing(1)};
    border-top: none;
    border-bottom: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
  }
`;

const SummaryContainer = styled.div`
  border-top: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
  border-bottom: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};
  padding: ${({ theme }) => theme.spacing(2)} 0;

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: none;
  }
`;

const ShippingInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: ${({ theme }) => theme.spacing(0, 1.5)};
  }
`;

const ShippingCodeText = styled.span`
  font-size: 13px;
  text-align: right;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
`;

const ShippingLogStepperContainer = styled.div`
  & .${stepLabelClasses.root} {
    padding: ${({ theme }) => theme.spacing(0.25, 0)};
    align-items: flex-start;
  }

  & .${stepLabelClasses.labelContainer} {
    width: 100%;
  }

  & .${stepLabelClasses.iconContainer} {
    font-size: 0.8rem;
  }

  & .${stepConnectorClasses.line} {
    min-height: 18px;
  }
`;

const ShippingLogRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const ShippingLogDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  line-height: 1.35;
  padding-top: ${({ theme }) => theme.spacing(0.35)};
`;

const ShippingLogLabel = styled.span`
  display: block;
  font-weight: 600;
  font-size: 13px;
  line-height: 1.4;
  color: ${({ theme }) => theme.vars.palette.text.primary};
`;

const ShippingLogSummary = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing(0.25)};
  font-size: 12px;
  line-height: 1.4;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
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

const LOG_PREVIEW_COUNT = 6;

const ORDER_STEPS = [
  { label: "order.status.completed.ordered", icon: <ReceiptOutlined /> },
  { label: "order.status.completed.paid", icon: <PaymentsOutlined /> },
  { label: "order.status.completed.picked", icon: <LocalShippingOutlined /> },
  { label: "order.status.completed.delivered", icon: <SaveAltOutlined /> },
  { label: "order.status.completed.completed", icon: <StarBorder /> },
];
const REFUND_STEPS = [
  { label: "order.status.completed.ordered", icon: <ReceiptOutlined /> },
  { label: "order.status.completed.paid", icon: <PaymentsOutlined /> },
  { label: "order.status.completed.returned", icon: <LocalShippingOutlined /> },
  { label: "order.status.completed.checked", icon: <PublishedWithChanges /> },
  { label: "order.status.completed.refunded", icon: <AssignmentReturnOutlined /> },
];
const CANCEL_STEPS = [
  { label: "order.status.completed.ordered", icon: <ReceiptOutlined /> },
  { label: "order.status.completed.cancelled", icon: <Close /> },
  { label: "order.status.completed.refunded", icon: <AssignmentReturnOutlined /> },
];

function getStepSummary(status) {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      return {
        summary: "order.summary.pending.payment",
        icon: <PaymentsOutlined />,
      };
    case OrderStatus.PENDING:
      return {
        summary: "order.summary.pending.transporting",
        icon: <LocalShippingOutlined />,
      };
    case OrderStatus.SHIPPING:
      return {
        summary: "order.summary.pending.delivering",
        icon: <LocalShippingOutlined />,
      };
    case OrderStatus.PENDING_RETURN:
      return {
        summary: "order.summary.pending.returning",
        icon: <KeyboardReturn />,
      };
    case OrderStatus.PENDING_REFUND:
      return {
        summary: "order.summary.pending.refund",
        icon: <AssignmentReturnOutlined />,
      };
    case OrderStatus.COMPLETED:
      return {
        summary: "order.summary.completed.done",
        icon: <StarBorder />,
      };
    case OrderStatus.CANCELED:
      return {
        summary: "order.summary.completed.cancelled",
        icon: <Close />,
      };
    case OrderStatus.REFUNDED:
      return {
        summary: "order.summary.completed.refunded",
        icon: <AssignmentReturnOutlined />,
      };
    case GHNReturnStatus.WAITING_FOR_RETURN:
      return {
        summary: "order.summary.pending.return.waiting",
        icon: <KeyboardReturn />,
      };
    case GHNReturnStatus.RETURN:
      return {
        summary: "order.summary.return",
        icon: <KeyboardReturn />,
      };
    case GHNReturnStatus.RETURN_TRANSPORTING:
      return {
        summary: "order.summary.pending.return.transporting",
        icon: <LocalShippingOutlined />,
      };
    case GHNReturnStatus.RETURN_SORTING:
      return {
        summary: "order.summary.pending.return.sorting",
        icon: <SaveAltOutlined />,
      };
    case GHNReturnStatus.RETURNING:
      return {
        summary: "order.summary.pending.return.returning",
        icon: <LocalShippingOutlined />,
      };
    case GHNReturnStatus.RETURNED:
      return {
        summary: "order.summary.completed.returned",
        icon: <LocalShippingOutlined />,
      };
    case GHNCancelStatus.CANCEL:
      return {
        summary: "order.summary.cancel",
        icon: <Close />,
      };
    case GHNFailStatus.RETURN_FAILED:
      return {
        summary: "order.summary.failed.return",
        icon: <Close />,
      };
    case GHNFailStatus.DELIVERY_FAILED:
      return {
        summary: "order.summary.failed.delivery",
        icon: <Close />,
      };
    case GHNFailStatus.DAMAGE:
      return {
        summary: "order.summary.failed.damage",
        icon: <Close />,
      };
    case GHNFailStatus.LOST:
      return {
        summary: "order.summary.failed.lost",
        icon: <Close />,
      };
    case GHNFailStatus.EXCEPTION:
      return {
        summary: "order.summary.failed.exception",
        icon: <Close />,
      };
    case GHNTransportStatus.STORING:
      return {
        summary: "order.summary.pending.storing",
        icon: <LocalShippingOutlined />,
      };
    case GHNTransportStatus.TRANSPORTING:
      return {
        summary: "order.summary.pending.transporting",
        icon: <LocalShippingOutlined />,
      };
    case GHNTransportStatus.SORTING:
      return {
        summary: "order.summary.pending.sorting",
        icon: <SaveAltOutlined />,
      };
    case GHNTransportStatus.DELIVERING:
      return {
        summary: "order.summary.pending.delivering",
        address: order?.address,
        icon: <LocalShippingOutlined />,
      };
    case GHNTransportStatus.MONEY_COLLECT_DELIVERING:
      return {
        summary: "order.summary.pending.cod",
        icon: <PaymentsOutlined />,
      };
    case GHNTransportStatus.DELIVERED:
      return {
        summary: "order.summary.completed.delivered",
        icon: <LocalShippingOutlined />,
      };
    case GHNPickupStatus.READY_TO_PICK:
      return {
        summary: "order.summary.ready",
        icon: <LocalShippingOutlined />,
      };
    case GHNPickupStatus.PICKING:
      return {
        summary: "order.summary.pending.picking",
        icon: <LocalShippingOutlined />,
      };
    case GHNPickupStatus.MONEY_COLLECT_PICKING:
      return {
        summary: "order.summary.pending.money",
        icon: <PaymentsOutlined />,
      };
    case GHNPickupStatus.PICKED:
      return {
        summary: "order.summary.completed.picked",
        icon: <LocalShippingOutlined />,
      };
    default:
      return {
        summary: "unknown",
        icon: <Close />,
      };
  }
}

function getStepContent(order, ghnOrder) {
  const orderedDate = order?.orderedDate ? new Date(order?.orderedDate) : null;
  const paidDate = order?.paidDate ? new Date(order?.paidDate) : null;
  let latestDate = order?.date ? new Date(order?.date) : null;
  let flow = "normal";
  let step = 0;
  let logs = [];

  if (paidDate) {
    logs.push({
      label: "order.status.completed.ordered",
      summary: "order.summary.completed.ordered",
      date: dateTimeFormatter(orderedDate),
      icon: <ReceiptOutlined />,
    });
  }

  if (ghnOrder) {
    const status = ghnOrder?.status?.toLowerCase();
    if (ghnOrder?.log?.length) {
      const latestLogDate = ghnOrder?.log[ghnOrder?.log.length - 1]?.updated_date;
      latestDate = latestLogDate ? new Date(latestLogDate) : latestDate;
    }

    let ghnLogs = ghnOrder?.log
      ? ghnOrder.log?.map((log) => ({
          status: (log?.status ?? ghnOrder?.status)?.toLowerCase(),
          label:
            getGHNStatus((log?.status ?? ghnOrder?.status)?.toLowerCase())?.label ??
            log?.status_name ??
            log?.status ??
            "unknown",
          summary: log?.description ?? log?.reason ?? log?.message ?? "",
          date: dateTimeFormatter(new Date(log?.updated_date)),
          icon: getStepSummary((log?.status ?? ghnOrder?.status)?.toLowerCase())?.icon ?? null,
        }))
      : [];
    logs = [...logs, ...ghnLogs];

    if (Object.values(GHNCancelStatus).includes(status)) {
      flow = "cancel";
      step = 1;
    } else if (Object.values(GHNReturnStatus).includes(status)) {
      const isDone = status === GHNReturnStatus.RETURN;
      flow = "refund";
      step = isDone ? 2 : 1;
    } else if (Object.values(GHNPickupStatus).includes(status)) {
      flow = "normal";
      step = 2;
    } else if (Object.values(GHNTransportStatus).includes(status)) {
      const isDone = status === GHNTransportStatus.DELIVERED;
      flow = "normal";
      step = isDone ? 3 : 2;
    } else if (Object.values(GHNFailStatus).includes(status)) {
      flow = "refund";
      step = 1;
    }
  } else {
    switch (order?.status) {
      case OrderStatus.PENDING_PAYMENT:
        flow = "normal";
        step = 1;
        break;
      case OrderStatus.PENDING:
        flow = "normal";
        step = 2;
        break;
      case OrderStatus.SHIPPING:
        flow = "normal";
        step = 2;
        break;
      case OrderStatus.PENDING_RETURN:
        flow = "refund";
        step = 3;
        break;
      case OrderStatus.PENDING_REFUND:
        flow = "refund";
        step = 3;
        break;
      case OrderStatus.COMPLETED:
        flow = "normal";
        step = 4;
        break;
      case OrderStatus.CANCELED:
        flow = "cancel";
        step = 1;

        logs.push({
          label: "order.status.completed.cancelled",
          summary: "order.summary.completed.cancelled",
          date: dateTimeFormatter(latestDate),
          icon: <Close />,
        });

        break;
      case OrderStatus.REFUNDED:
        flow = "refund";
        step = 4;
        break;
    }
  }

  return {
    flow,
    step,
    orderedDate,
    paidDate,
    price: order?.totalPrice - order?.totalDiscount,
    date: latestDate,
    logs: logs.reverse(),
    address: order?.address,
  };
}

const StepContent = ({ content, stepLabel, stepColor, isLoading }) => {
  const { t, i18n } = useTranslation();
  const mainSteps = content?.flow === "cancel" ? CANCEL_STEPS : content?.flow === "refund" ? REFUND_STEPS : ORDER_STEPS;
  const currStep = content?.step;

  return (
    <StepperContainer>
      {isLoading ? (
        <Placeholder sx={{ height: { xs: 60, md: 126 } }} />
      ) : (
        <Stepper alternativeLabel connector={<StyledStepConnector color={stepColor} />} activeStep={content?.step}>
          {mainSteps.map((step, index) => {
            if (index == 2 && mainSteps.length <= 3 && !content?.paidDate) return;

            return (
              <Step key={index}>
                <StyledStepLabel
                  slotProps={{
                    stepIcon: {
                      color: stepColor,
                      icon: step.icon,
                    },
                  }}
                  slots={{ stepIcon: StyledStepIcon }}
                >
                  <div>
                    {index < currStep
                      ? t(step.label, { ns: "authenticated" })
                      : index == currStep
                        ? t(stepLabel, { ns: "authenticated" })
                        : ""}
                    {index === 0 && content?.orderedDate && (
                      <DateText>{dateTimeFormatter(content?.orderedDate, i18n.language)}</DateText>
                    )}
                    {index === 1 && mainSteps.length > 3 && content?.paidDate && (
                      <DateText>{dateTimeFormatter(content?.paidDate, i18n.language)}</DateText>
                    )}
                    {index === currStep && content?.date && (
                      <DateText>{dateTimeFormatter(new Date(content?.date), i18n.language)}</DateText>
                    )}
                  </div>
                  {content?.stepContent?.step >= index && (
                    <LabelCheck color={stepColor}>
                      {content?.flow === "cancel" ? (
                        <Close />
                      ) : content?.flow === "refund" ? (
                        <KeyboardReturn />
                      ) : (
                        <Check />
                      )}
                    </LabelCheck>
                  )}
                </StyledStepLabel>
              </Step>
            );
          })}
        </Stepper>
      )}
    </StepperContainer>
  );
};

const ShippingLogStepper = ({ logs, isLoading }) => {
  const { t } = useTranslation();
  const [showAllLogs, setShowAllLogs] = useState(false);

  const canExpand = logs?.length > LOG_PREVIEW_COUNT;
  const visibleLogs = showAllLogs ? logs : logs?.slice(0, LOG_PREVIEW_COUNT);

  const getDisplayText = (value) => {
    if (!value) return t("unknown");
    return value.includes(".") ? t(value, { ns: "authenticated" }) : value;
  };

  /**
   * Toggle show all logs
   */
  const toggleShowAllLogs = () => {
    setShowAllLogs((prev) => !prev);
  };

  return (
    <ShippingInfoContainer>
      {isLoading ? (
        <Placeholder sx={{ height: { xs: 41, md: 105 } }} />
      ) : (
        <>
          <ShippingLogStepperContainer>
            <Stepper activeStep={0} connector={<StyledStepConnector />} orientation="vertical">
              {visibleLogs?.map((log, index) => {
                return (
                  <Step key={`${log?.date ?? "log"}-${index}`} expanded>
                    <StepLabel
                      slotProps={{
                        stepIcon: {
                          className: "shipping",
                          icon: log?.icon,
                        },
                      }}
                      slots={{ stepIcon: StyledStepIcon }}
                    >
                      <ShippingLogRow>
                        <ShippingLogDate>{log?.date ?? t("unknown")}</ShippingLogDate>
                        <div>
                          <ShippingLogLabel>{getDisplayText(log?.label)}</ShippingLogLabel>
                          {Boolean(log?.summary) && (
                            <ShippingLogSummary>{getDisplayText(log?.summary)}</ShippingLogSummary>
                          )}
                        </div>
                      </ShippingLogRow>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </ShippingLogStepperContainer>
          {canExpand && (
            <Box>
              <Button size="small" onClick={toggleShowAllLogs}>
                {showAllLogs ? t("show.less") : t("show.more")}
              </Button>
            </Box>
          )}
        </>
      )}
    </ShippingInfoContainer>
  );
};

const OrderShippingInfo = ({
  order,
  tabletMode,
  handleCancelOrder,
  handleRefundOrder,
  handleConfirmOrder,
  handleAddToCart,
  isRefundable,
}) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data, isLoading, isUninitialized } = useGetGHNOrderDetailQuery(order?.id, {
    skip: !order?.id || !order?.orderCode,
  });

  /**
   * Toggle stepper
   */
  const toggleStepper = () => {
    setOpen((prev) => !prev);
  };

  const stepContent = useMemo(() => getStepContent(order, data), [order, data]);
  const stepMeta = data?.status ? getGHNStatus(data?.status) : getOrderStatus(order?.status);
  const stepLabel = t(stepMeta?.label, { ns: "authenticated" });
  const stepColor = stepMeta?.color;
  const stepSummary = getStepSummary(data?.status ?? order?.status);
  const showPlaceholder = !order || (order?.orderCode && (isLoading || isUninitialized));
  const hasShippingLogs = Boolean(stepContent?.logs?.length);

  return (
    <>
      {tabletMode ? (
        <>
          <StatusContent color={stepColor} onClick={toggleStepper}>
            <div>
              <Box display="flex" alignItems="flex-start">
                {showPlaceholder ? <Skeleton variant="text" width={100} /> : stepLabel}
                <ToggleArrow>
                  {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                </ToggleArrow>
              </Box>
              <p>
                {showPlaceholder ? (
                  <Skeleton variant="text" width={200} />
                ) : (
                  t(stepSummary?.summary, {
                    ns: "authenticated",
                    address: order?.address,
                    amount: currencyFormat.format(order?.totalPrice - order?.totalDiscount),
                  })
                )}
              </p>
              <span className="subtitle">
                {showPlaceholder ? (
                  <Skeleton variant="text" width={100} />
                ) : (
                  dateTimeFormatter(new Date(stepContent?.date), i18n.language)
                )}
              </span>
            </div>
            <SummaryIcon>{!showPlaceholder && stepSummary?.icon}</SummaryIcon>
          </StatusContent>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {[
              OrderStatus.CANCELED,
              OrderStatus.PENDING_RETURN,
              OrderStatus.PENDING_REFUND,
              OrderStatus.REFUNDED,
            ]?.includes(order?.status) &&
              order?.note && (
                <ReasonContainer>
                  <Name>{t("order.reason.label", { ns: "authenticated" })}:</Name>
                  <InfoText>{order?.note}</InfoText>
                </ReasonContainer>
              )}
            <CollapseContent>
              <StepContent
                content={stepContent}
                stepLabel={stepLabel}
                stepColor={stepColor}
                isLoading={showPlaceholder}
              />
              {hasShippingLogs && <ShippingLogStepper logs={stepContent?.logs} isLoading={showPlaceholder} />}
            </CollapseContent>
          </Collapse>
        </>
      ) : (
        <>
          <StepContent content={stepContent} stepLabel={stepLabel} stepColor={stepColor} isLoading={showPlaceholder} />
          <SummaryContainer>
            <Box display="flex" justifyContent="space-between">
              <SubText>
                {!order ? (
                  <Skeleton variant="text" width={280} />
                ) : (
                  t(stepSummary?.summary, {
                    ns: "authenticated",
                    address: order?.address,
                    amount: currencyFormat.format(order?.totalPrice - order?.totalDiscount),
                  })
                )}
              </SubText>
              <Box>
                {!order ? (
                  <MainButton disabled variant="contained" color="secondary" size="large" fullWidth>
                    {t("loading")}
                  </MainButton>
                ) : order?.status == OrderStatus.PENDING ? (
                  <>
                    <MainButton variant="outlined" color="error" size="large" fullWidth onClick={handleCancelOrder}>
                      {t("order.cancel.label", { ns: "authenticated" })}
                    </MainButton>
                  </>
                ) : order?.status == OrderStatus.SHIPPING && order?.paymentStatus == PaymentStatus.PAID ? (
                  <MainButton variant="contained" color="success" size="large" fullWidth onClick={handleConfirmOrder}>
                    {t("order.confirm.confirmed", { ns: "authenticated" })}
                  </MainButton>
                ) : order?.status == OrderStatus.PENDING_PAYMENT ? (
                  <MainButton
                    component={Link}
                    to={`/profile/order/checkout/${order?.orderId}`}
                    variant="contained"
                    color="warning"
                    size="large"
                    fullWidth
                  >
                    {t("order.checkout")}
                  </MainButton>
                ) : (
                  <>
                    <MainButton variant="contained" color="primary" size="large" fullWidth onClick={handleAddToCart}>
                      {t("order.again", { ns: "authenticated" })}
                    </MainButton>
                    {order?.status == OrderStatus.COMPLETED && isRefundable && (
                      <MainButton
                        variant="outlined"
                        color="warning"
                        size="large"
                        fullWidth
                        onClick={handleRefundOrder}
                        disabled={!isRefundable}
                      >
                        {t("order.refund.label", { ns: "authenticated" })}
                      </MainButton>
                    )}
                  </>
                )}
              </Box>
            </Box>
            {[
              OrderStatus.CANCELED,
              OrderStatus.PENDING_RETURN,
              OrderStatus.PENDING_REFUND,
              OrderStatus.REFUNDED,
            ]?.includes(order?.status) &&
              order?.note && (
                <ReasonContainer>
                  <Name>{t("order.reason.label", { ns: "authenticated" })}:</Name>
                  <InfoText>{order?.note}</InfoText>
                </ReasonContainer>
              )}
          </SummaryContainer>
        </>
      )}
      <ContentWrapper>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Title>
            <SellIcon />
            &nbsp;{t("order.shipping", { ns: "authenticated" })}
          </Title>
          {!tabletMode && (
            <ShippingCodeText>
              {t("checkout.shipping.ghn", { ns: "authenticated" })}:&nbsp;
              {order?.orderCode ?? t("unknown")}
            </ShippingCodeText>
          )}
        </Box>
        <Grid container spacing={0}>
          <Grid size={{ xs: 12, md_lg: 5 }}>
            <InfoContainer>
              <div>
                <Name>
                  {!order ? <Skeleton variant="text" width={150} /> : (order?.companyName ?? order?.name) + " "}
                </Name>
                <InfoText>{!order ? <Skeleton variant="text" width={140} /> : `(+84) ${order?.phone}`}</InfoText>
              </div>
              <InfoText>
                {!order ? (
                  <Box width="100%">
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="30%" />
                  </Box>
                ) : (
                  (order?.address ?? t("unknown"))
                )}
              </InfoText>
            </InfoContainer>
          </Grid>
          {!tabletMode && (
            <Grid size={{ xs: 12, md_lg: 7 }}>
              <InfoContainer className="shipping-log">
                {hasShippingLogs ? (
                  <ShippingLogStepper logs={stepContent?.logs} isLoading={showPlaceholder} />
                ) : (
                  <>
                    <Name>{t("order.shipping", { ns: "authenticated" })}:</Name>
                    <InfoText>
                      {!order ? (
                        <Skeleton variant="text" width={210} />
                      ) : (
                        `${t("order.code", { ns: "authenticated" })}:
                    ${order?.orderCode ?? t("unknown")}`
                      )}
                    </InfoText>
                    <InfoText>
                      {!order ? (
                        <Skeleton variant="text" width={150} />
                      ) : (
                        t("checkout.shipping.ghn", { ns: "authenticated" })
                      )}
                    </InfoText>
                    <InfoText className="price">
                      {!order ? (
                        <Skeleton variant="text" width={190} />
                      ) : (
                        `${t("cart.shipping.fee")} ${currencyFormat.format(order?.shippingFee)}`
                      )}
                    </InfoText>
                  </>
                )}
              </InfoContainer>
            </Grid>
          )}
          {![
            OrderStatus.CANCELED,
            OrderStatus.PENDING_RETURN,
            OrderStatus.PENDING_REFUND,
            OrderStatus.REFUNDED,
          ]?.includes(order?.status) &&
            order?.note && (
              <Grid size={12}>
                <InfoContainer className="note">
                  <Name>{t("order.note", { ns: "authenticated" })}:</Name>
                  <InfoText>{order?.note}</InfoText>
                </InfoContainer>
              </Grid>
            )}
        </Grid>
      </ContentWrapper>
    </>
  );
};

export default OrderShippingInfo;
