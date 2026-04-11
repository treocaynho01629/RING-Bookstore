import { useFollowShopMutation, useUnfollowShopMutation } from "../../features/shops/shopsApiSlice";
import { Link, useLocation, useNavigate } from "react-router";
import { numFormat, dateFormatter } from "@ring/shared/utils/convert";
import { useTranslation } from "react-i18next";
import { ShopContainer, ShopInfo, ShopName, Verified, ShopDetail } from "./ShopComponents";
import useAuth from "../../hooks/useAuth";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Add from "@mui/icons-material/Add";
import AutoStories from "@mui/icons-material/AutoStories";
import Block from "@mui/icons-material/Block";
import Check from "@mui/icons-material/Check";
import LocalActivity from "@mui/icons-material/LocalActivity";
import Person4 from "@mui/icons-material/Person4";
import PersonAddAlt1 from "@mui/icons-material/PersonAddAlt1";
import Store from "@mui/icons-material/Store";
import Today from "@mui/icons-material/Today";
import VerifiedIcon from "@mui/icons-material/Verified";

const ShopDetailComponent = ({ shop, name }) => {
  const { username } = useAuth();
  const { t, i18n } = useTranslation();

  const [followShop, { isLoading: following }] = useFollowShopMutation();
  const [unfollowShop, { isLoading: unfollowing }] = useUnfollowShopMutation();

  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Handle click follow shop
   * @returns {void}
   */
  const handleClickFollow = () => {
    if (!username) navigate("/auth/login", { state: { from: location } });
    if (!shop || following || unfollowing || !username) return;

    if (shop?.followed) {
      unfollowShop(shop?.id)
        .unwrap()
        .catch((err) => {
          console.error(err);
        });
    } else {
      followShop(shop?.id)
        .unwrap()
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const date = new Date(shop?.joinedDate);

  return (
    <ShopContainer>
      <Grid container spacing={1} sx={{ width: "100%" }}>
        <Grid size={{ xs: 12, md: 4.5 }}>
          {!shop ? (
            <ShopInfo>
              <Skeleton
                variant="circular"
                sx={{
                  width: { xs: 50, md: 75 },
                  height: { xs: 50, md: 75 },
                  marginRight: { xs: 0.5, md: 2 },
                }}
              />
              <Box
                display={{ xs: "flex", md: "block" }}
                justifyContent="space-between"
                alignItems="center"
                flexGrow={1}
              >
                <Box mb={{ xs: 0, md: 1 }}>
                  <Skeleton
                    variant="text"
                    sx={{
                      fontSize: { xs: "15px", md: "18px" },
                      width: { xs: 110, md: "90%" },
                    }}
                  />
                  <Skeleton variant="text" sx={{ fontSize: "13px" }} width={100} />
                </Box>
                <Skeleton variant="rectangular" sx={{ height: 35, width: { xs: 100, md: "100%" } }} />
              </Box>
            </ShopInfo>
          ) : (
            <ShopInfo>
              <Link to={`/shop/${shop?.id}`}>
                <Avatar
                  alt={`${name || shop?.name} shop avatar`}
                  sx={{
                    width: { xs: 50, md: 75 },
                    height: { xs: 50, md: 75 },
                    marginRight: { xs: 0.5, md: 2 },
                  }}
                  src={shop?.image ?? null}
                >
                  <Store fontSize="large" />
                </Avatar>
              </Link>
              <Box
                display={{ xs: "flex", md: "block" }}
                justifyContent="space-between"
                alignItems="center"
                flexGrow={1}
              >
                <Link to={`/shop/${shop?.id}`}>
                  <Box mb={{ xs: 0, md: 1 }}>
                    <ShopName className={shop?.verified ? "" : "unverified"}>{shop?.name}</ShopName>
                    {shop?.verified && (
                      <Verified>
                        <VerifiedIcon sx={{ fontSize: "16px", marginRight: 1 }} color="primary" />
                        {t("official")}
                      </Verified>
                    )}
                  </Box>
                </Link>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ height: 35, width: { xs: "auto", md: "100%" } }}
                  disabled={!shop || following || unfollowing}
                  onClick={handleClickFollow}
                  color={shop?.followed ? "warning" : "primary"}
                  startIcon={shop?.followed ? <Check /> : <Add />}
                >
                  {shop?.followed ? t("shop.following") : t("shop.follow")}
                </Button>
              </Box>
            </ShopInfo>
          )}
        </Grid>
        <Grid
          size={{ xs: 12, md: "grow" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          padding={{ xs: 0, md: "0 25px" }}
        >
          <Stack spacing={{ xs: 1, md: 2 }} direction="row" useFlexGap sx={{ flexWrap: "wrap", width: "100%" }}>
            {!shop ? (
              <>
                <ShopDetail>
                  <Skeleton
                    variant="text"
                    sx={{
                      fontSize: { xs: "12px", md: "14px" },
                      width: { xs: 95, md: 100 },
                    }}
                  />
                </ShopDetail>
                <ShopDetail>
                  <Skeleton
                    variant="text"
                    sx={{
                      fontSize: { xs: "12px", md: "14px" },
                      width: { xs: 95, md: 110 },
                    }}
                  />
                </ShopDetail>
                <ShopDetail>
                  <Skeleton
                    variant="text"
                    sx={{
                      fontSize: { xs: "12px", md: "14px" },
                      width: { xs: 95, md: 150 },
                    }}
                  />
                </ShopDetail>
                <ShopDetail>
                  <Skeleton
                    variant="text"
                    sx={{
                      fontSize: { xs: "12px", md: "14px" },
                      width: { xs: 95, md: 100 },
                    }}
                  />
                </ShopDetail>
                <ShopDetail>
                  <Skeleton
                    variant="text"
                    sx={{
                      fontSize: { xs: "12px", md: "14px" },
                      width: { xs: 95, md: 110 },
                    }}
                  />
                </ShopDetail>
                <ShopDetail>
                  <Skeleton
                    variant="text"
                    sx={{
                      fontSize: { xs: "12px", md: "14px" },
                      width: { xs: 95, md: 150 },
                    }}
                  />
                </ShopDetail>
              </>
            ) : (
              <>
                <ShopDetail>
                  <LocalActivity />
                  {t("review.label")}:
                  <b>{`${(shop?.rating ?? 0).toFixed(1)} (${numFormat.format(shop?.totalReviews)})`}</b>
                </ShopDetail>
                <ShopDetail>
                  <AutoStories />
                  {t("product.label")}:<b>{numFormat.format(shop?.totalProducts)}</b>
                </ShopDetail>
                <ShopDetail>
                  <PersonAddAlt1 />
                  {t("follower")}:<b>{numFormat.format(shop?.totalFollowers)}</b>
                </ShopDetail>
                <ShopDetail>
                  <Block />
                  {t("shop.rate")}:<b>{shop?.canceledRate * 100}%</b>
                </ShopDetail>
                <ShopDetail>
                  <Person4 />
                  {t("shop.owner")}:<b>{shop?.username}</b>
                </ShopDetail>
                <ShopDetail>
                  <Today />
                  {t("joined.label")}:<b>{dateFormatter(date, i18n.language)}</b>
                </ShopDetail>
              </>
            )}
          </Stack>
        </Grid>
      </Grid>
    </ShopContainer>
  );
};

export default ShopDetailComponent;
