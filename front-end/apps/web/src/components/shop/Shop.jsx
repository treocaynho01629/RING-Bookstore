import styled from "@emotion/styled";
import { dateFormatter, numFormat } from "@ring/shared/utils/convert";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import Add from "@mui/icons-material/Add";
import AutoStories from "@mui/icons-material/AutoStories";
import Check from "@mui/icons-material/Check";
import LocalActivity from "@mui/icons-material/LocalActivity";
import PersonAddAlt1 from "@mui/icons-material/PersonAddAlt1";
import Store from "@mui/icons-material/Store";
import VerifiedIcon from "@mui/icons-material/Verified";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

//#region styled
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.hover};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const Container = styled.div`
  width: 100%;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: flex;
    justify-content: space-between;
  }
`;

const ShopName = styled.h3`
  margin: 0;
  white-space: nowrap;

  ${({ theme }) => theme.breakpoints.down("md")} {
    font-size: 15px;
  }
`;

const Verified = styled.p`
  font-size: 14px;
  margin: 0;
  display: flex;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
`;

const DateText = styled.span`
  font-size: 15px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
  }
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    flex-direction: row;
  }
`;

const DetailsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-top: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  border-top: 0.5px dashed ${({ theme }) => theme.vars.palette.divider};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    border: none;
    padding-top: 0;
  }
`;

const ShopDetail = styled.span`
  flex-grow: 1;
  font-size: 14px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    flex-direction: row;
    font-size: 12px;
    width: auto;
  }
`;

const Stats = styled.span`
  display: flex;
  align-items: flex-start;
  color: ${({ theme }) => theme.vars.palette.warning.main};

  svg {
    font-size: 18px;
    margin-right: 3px;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    svg {
      font-size: 15px;
    }

    margin-left: 5px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1.5, 1, 1)};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    width: auto;
  }
`;
//#endregion

const Shop = ({ shop, onClickFollow }) => {
  const { t, i18n } = useTranslation();

  /**
   * Click follow
   */
  const handleClickFollow = () => {
    if (onClickFollow) onClickFollow(shop);
  };

  const date = new Date(shop?.joinedDate);

  return (
    <Wrapper>
      <Container>
        <Link to={`/shop/${shop?.id}`}>
          <TopContainer>
            <Avatar
              alt={`${shop?.name} shop avatar`}
              sx={{
                width: { xs: 50, md: 60 },
                height: { xs: 50, md: 60 },
                mt: { xs: 0, sm: 3 },
                mb: { xs: 0, sm: 1 },
                mr: { xs: 1, sm: 0 },
              }}
              src={shop?.image ?? null}
            >
              <Store fontSize="large" />
            </Avatar>
            <Box display="flex" alignItems="center" flexDirection="column" justifyContent="center">
              <ShopName>{shop?.name}</ShopName>
              <Verified>
                <VerifiedIcon sx={{ fontSize: "16px", marginRight: 1 }} color="primary" />
                {t("official")}
              </Verified>
              <DateText>
                {t("shop.joined")}:&nbsp;
                <b>{dateFormatter(date, i18n.language)}</b>
              </DateText>
            </Box>
          </TopContainer>
        </Link>
        <ButtonContainer>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClickFollow}
            color={shop?.followed ? "warning" : "primary"}
            startIcon={shop?.followed ? <Check /> : <Add />}
          >
            {shop?.followed ? t("shop.following") : t("shop.follow")}
          </Button>
          <Button size="small" variant="outlined" color="info" sx={{ display: { xs: "none", sm: "flex" } }}>
            <Link to={`/shop/${shop?.id}`}>{t("shop.view")}</Link>
          </Button>
        </ButtonContainer>
      </Container>
      <DetailsContainer>
        <ShopDetail>
          {t("review.label")}:
          <Stats>
            <LocalActivity color="warning" />
            <b>{numFormat.format(shop?.totalReviews)}</b>
          </Stats>
        </ShopDetail>
        <ShopDetail>
          {t("product.label")}:
          <Stats>
            <AutoStories color="warning" />
            <b>{numFormat.format(shop?.totalProducts)}</b>
          </Stats>
        </ShopDetail>
        <ShopDetail>
          {t("shop.following")}:
          <Stats>
            <PersonAddAlt1 color="warning" />
            <b>{numFormat.format(shop?.totalFollowers)}</b>
          </Stats>
        </ShopDetail>
      </DetailsContainer>
    </Wrapper>
  );
};

export default Shop;
