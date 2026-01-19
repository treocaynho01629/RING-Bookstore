import AutoStoriesOutlined from "@mui/icons-material/AutoStoriesOutlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import EventOutlined from "@mui/icons-material/EventOutlined";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import StarBorder from "@mui/icons-material/StarBorder";
import Storefront from "@mui/icons-material/Storefront";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";

interface NavigationItem {
  label: string;
  icon: React.ReactNode;
  url: string;
  isAdmin?: boolean;
  subItems?: NavigationItem[];
}

export const navigationList: NavigationItem[] = [
  {
    label: "product.label",
    icon: <AutoStoriesOutlined />,
    url: "/product",
  },
  {
    label: "store",
    icon: <Storefront />,
    url: "/shop",
  },
  {
    isAdmin: true,
    label: "user.member",
    icon: <GroupOutlined />,
    url: "/user",
  },
  {
    label: "review.label",
    icon: <StarBorder />,
    url: "/review",
  },
  {
    label: "coupon.label",
    icon: <LocalActivityOutlined />,
    url: "/coupon",
  },
  {
    label: "statistics.label",
    icon: <TrendingUpOutlined />,
    url: "/order",
  },
  {
    label: "event.label",
    icon: <EventOutlined />,
    url: "/event",
  },
  {
    isAdmin: true,
    label: "user.privilege",
    icon: <ShieldOutlined />,
    url: "/auth",
  },
  {
    isAdmin: true,
    label: "misc",
    icon: <CategoryOutlined />,
    url: "/misc",
  },
];
