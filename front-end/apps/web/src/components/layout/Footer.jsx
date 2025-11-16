import styled from "@emotion/styled";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Facebook from "@mui/icons-material/Facebook";
import YouTube from "@mui/icons-material/YouTube";
import LinkedIn from "@mui/icons-material/LinkedIn";
import Twitter from "@mui/icons-material/Twitter";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";

//#region styled
const Wrapper = styled.footer`
  background-color: ${({ theme }) => theme.vars.palette.divider};
  border-top: 2px solid ${({ theme }) => theme.vars.palette.primary.main};
  margin-top: 15dvh;
  padding-top: 20px;
  width: 100%;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-top: ${({ theme }) => theme.spacing(2)};
  }
`;

const Container = styled.div`
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
  display: flex;
  justify-content: center;

  ${({ theme }) => theme.breakpoints.up("sm_md")} {
    width: 750px;
  }
  ${({ theme }) => theme.breakpoints.up("md_lg")} {
    width: 970px;
  }
  ${({ theme }) => theme.breakpoints.up("lg")} {
    width: 1170px;
  }
`;

const BotFooter = styled.div`
  height: 35px;
  padding: 0 30px;
  background-color: ${({ theme }) => theme.vars.palette.action.focus};
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 0 15px;
    justify-content: center;
  }
`;

const Logo = styled.img`
  max-height: 70px;
  width: auto;
  object-fit: contain;
  object-position: left;

  ${({ theme }) => theme.breakpoints.down("md")} {
    max-height: 55px;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    max-height: 40px;
    margin: 10px 0;
  }
`;

const Description = styled.p`
  margin: 14px 0px;
  font-size: 13px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    text-align: center;
    margin: 5px 0;
  }
`;

const Social = styled.div`
  display: flex;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const SocialIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: ${({ theme }) => theme.vars.palette.common.white};
  background-color: #${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 7px;
  margin-bottom: 7px;
  transition: all 0.25s ease;
  cursor: pointer;

  svg {
    font-size: 20px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: scale(1.1);
      border-radius: 45%;
    }
  }
`;

const AddressContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px 0px;

  ${({ theme }) => theme.breakpoints.down("lg")} {
    align-items: center;
    padding: 10px;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding-top: 0;
    margin-bottom: 5px;
    border-bottom: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  }
`;

const Title = styled.h4`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-transform: uppercase;
  cursor: pointer;

  svg {
    display: none;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin: 5px 10px;
    color: ${({ theme }) => theme.vars.palette.primary.dark};

    svg {
      display: block;
    }
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;

const MobileList = styled.ul`
  margin: 5px 0;
  list-style: none;
  display: none;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: block;
  }
`;

const ListItem = styled.li`
  width: 90%;
  font-size: 13px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.25s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme }) => theme.vars.palette.primary.dark};
    }
  }
`;

const PaymentList = styled.li`
  display: flex;
  flex-wrap: wrap;
`;

const Payment = styled.div`
  width: 80px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 11px;
  margin-right: 3px;
  margin-bottom: 3px;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: ${({ theme }) => theme.vars.palette.primary.light};
      color: ${({ theme }) => theme.vars.palette.primary.contrastText};
      transform: translateX(5px);
    }
  }
`;

const BotText = styled.p`
  font-size: 13px;
  margin: 0 10px;
  font-weight: 400;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  justify-content: center;
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
    width: 100%;
    margin: 0;
    font-size: 11px;
  }
`;

const Name = styled.b`
  font-size: 14px;
  margin: 0 10px;
  text-decoration: underline;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;
//#endregion

const supportItems = [
  {
    title: "footer.support.refund",
  },
  {
    title: "footer.support.shipping",
  },
  {
    title: "footer.support.payment",
  },
  {
    title: "footer.support.faq",
  },
  {
    title: "footer.support.order",
  },
];

const informationItems = [
  {
    title: "footer.information.about",
  },
  {
    title: "footer.information.recruitment",
  },
];

const servicesItems = [
  {
    title: "footer.services.privacy",
  },
  {
    title: "footer.services.warehouse",
  },
];

const paymentsItems = [
  {
    title: "footer.payments.payment",
  },
  {
    title: "footer.payments.cash",
  },
  {
    title: "footer.payments.payOS",
  },
];

const Footer = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  /**
   * Toggle the open state of the tab
   * @param {string} tab - The tab to open
   */
  const handleClick = (tab) => {
    setOpen((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  const support = supportItems.map((item) => <ListItem key={item.title}>{t(item.title)}</ListItem>);
  const information = informationItems.map((item) => <ListItem key={item.title}>{t(item.title)}</ListItem>);
  const services = servicesItems.map((item) => <ListItem key={item.title}>{t(item.title)}</ListItem>);
  const payments = paymentsItems.map((item) => <ListItem key={item.title}>{t(item.title)}</ListItem>);

  return (
    <Wrapper>
      <Container>
        <Grid container spacing={3} size="grow">
          <Grid size={{ xs: 12, lg: "auto" }}>
            <AddressContainer>
              <Logo src="/full-logo.svg" alt="RING! logo" />
              <Description>{t("footer.address")}</Description>
              <Social>
                <SocialIcon color="3B5999">
                  <Facebook />
                </SocialIcon>
                <SocialIcon color="FF0000">
                  <YouTube />
                </SocialIcon>
                <SocialIcon color="0A66C2">
                  <LinkedIn />
                </SocialIcon>
                <SocialIcon color="55ACEE">
                  <Twitter />
                </SocialIcon>
              </Social>
            </AddressContainer>
          </Grid>
          <Grid container spacing={0.5} size={{ xs: 12, lg: "grow" }} mb={{ xs: 3, sm: 6 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Title onClick={() => handleClick("support")}>
                {t("footer.support.title")} {open["support"] ? <ExpandLess /> : <ExpandMore />}
              </Title>
              <List>{support}</List>
              <Collapse in={open["support"]} timeout="auto" unmountOnExit>
                <MobileList>{support}</MobileList>
              </Collapse>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Title onClick={() => handleClick("information")}>
                {t("footer.information.title")} {open["information"] ? <ExpandLess /> : <ExpandMore />}
              </Title>
              <List>{information}</List>
              <Collapse in={open["information"]} timeout="auto" unmountOnExit>
                <MobileList>{information}</MobileList>
              </Collapse>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Title onClick={() => handleClick("services")}>
                {t("footer.services.title")} {open["services"] ? <ExpandLess /> : <ExpandMore />}
              </Title>
              <List>{services}</List>
              <Collapse in={open["services"]} timeout="auto" unmountOnExit>
                <MobileList>{services}</MobileList>
              </Collapse>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Title onClick={() => handleClick("payments")}>
                {t("footer.payments.title")} {open["payments"] ? <ExpandLess /> : <ExpandMore />}
              </Title>
              <List>{payments}</List>
              <Collapse in={open["payments"]} timeout="auto" unmountOnExit>
                <MobileList>{payments}</MobileList>
              </Collapse>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <BotFooter>
        <BotText>{t("footer.copyright", { year: new Date().getFullYear(), ns: "client" })}</BotText>
        <Name>DoraZ</Name>
      </BotFooter>
    </Wrapper>
  );
};

export default Footer;
