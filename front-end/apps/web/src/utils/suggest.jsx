import InsertEmoticon from "@mui/icons-material/InsertEmoticon";
import LocalActivity from "@mui/icons-material/LocalActivity";
import LocalMall from "@mui/icons-material/LocalMall";
import Loyalty from "@mui/icons-material/Loyalty";
import MonetizationOn from "@mui/icons-material/MonetizationOn";
import NewReleases from "@mui/icons-material/NewReleases";
import ShoppingCartCheckout from "@mui/icons-material/ShoppingCartCheckout";
import Store from "@mui/icons-material/Store";
import ThumbUp from "@mui/icons-material/ThumbUp";
import Whatshot from "@mui/icons-material/Whatshot";

export const suggest = [
  {
    icon: <Whatshot />,
    color: "#d07165",
    label: "landing.hot",
    url: "/store?sort=totalOrders",
  },
  {
    icon: <LocalMall />,
    color: "#c685c3 ",
    label: "search.label",
    url: "/store",
  },
  {
    icon: <Loyalty />,
    color: "#87c86d",
    label: "coupon.label",
    url: "/profile/coupon",
  },
  {
    icon: <NewReleases />,
    color: "#ddb067",
    label: "landing.new",
    url: "/store?sort=createdDate",
  },
  {
    icon: <Store />,
    color: "#8fb2c6",
    label: "store",
    url: "/shop",
  },
  {
    icon: <MonetizationOn />,
    color: "#dbad63",
    label: "cart.discount",
    url: "/",
  },
  {
    icon: <ShoppingCartCheckout />,
    color: "#a0df6d ",
    label: "cart.label",
    url: "/cart",
  },
  {
    icon: <ThumbUp />,
    color: "#e6eb62 ",
    label: "search.sort.favorite",
    url: "/store?sort=rating",
  },
  {
    icon: <InsertEmoticon />,
    color: "#aaaa9f ",
    label: "profile.label",
    url: "/profile/detail",
  },
  {
    icon: <LocalActivity />,
    color: "#a0e3de ",
    label: "landing.event",
    url: "/",
  },
];

export const orderTabs = [
  {
    filters: { sortBy: "totalOrders" },
    label: "search.sort.best-selling",
  },
  {
    filters: { sortBy: "createdDate" },
    label: "search.sort.latest",
  },
  {
    filters: { sortBy: "rating" },
    label: "search.sort.favorite",
  },
];
