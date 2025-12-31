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
    label: "Sản phẩm",
    icon: <AutoStoriesOutlined />,
    url: "/product",
  },
  {
    label: "Cửa hàng",
    icon: <Storefront />,
    url: "/shop",
  },
  {
    isAdmin: true,
    label: "Thành viên",
    icon: <GroupOutlined />,
    url: "/user",
  },
  {
    label: "Đánh giá",
    icon: <StarBorder />,
    url: "/review",
  },
  {
    label: "Mã giảm giá",
    icon: <LocalActivityOutlined />,
    url: "/coupon",
  },
  {
    label: "Doanh thu",
    icon: <TrendingUpOutlined />,
    url: "/order",
  },
  {
    label: "Sự kiện",
    icon: <EventOutlined />,
    url: "/event",
  },
  {
    isAdmin: true,
    label: "Quyền",
    icon: <ShieldOutlined />,
    url: "/auth",
  },
  {
    isAdmin: true,
    label: "Khác",
    icon: <CategoryOutlined />,
    url: "/misc",
  },
];
