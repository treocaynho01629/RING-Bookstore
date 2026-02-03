import { useTranslations } from "next-intl";
import { Shop } from "@/hooks/useShop";
import { PreviewResponse, PreviewsState } from "@/features/shops/shopsApiSlice";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Store from "@mui/icons-material/Store";
import Link from "next/link";

interface ShopSelectProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  shop: Shop | null;
  setShop: (shop: Shop) => void;
  clearShop: () => void;
  data?: PreviewsState;
}

const ShopSelect = ({ open, anchorEl, handleClose, shop, setShop, clearShop, data }: ShopSelectProps) => {
  const t = useTranslations();

  /**
   * Set main shop
   * @param shop
   */
  const handleSetShop = (shop: PreviewResponse): void => {
    setShop({ id: shop?.id ?? null, name: shop?.name ?? null });
  };

  let shopsContent;
  if (data) {
    const { ids, entities } = data;

    shopsContent = ids?.length ? (
      ids?.map((id, index) => {
        const shopEntity = entities[id];

        return (
          <MenuItem
            key={`${id}-${index}`}
            value={id}
            selected={id == shop?.id}
            onClick={() => handleSetShop(shopEntity)}
            sx={{ px: 1, fontSize: 14 }}
          >
            <Avatar src={shopEntity?.image ?? undefined} sx={{ width: 22, height: 22, mr: 1 }}>
              <Store fontSize="small" />
            </Avatar>
            {shopEntity?.name}
          </MenuItem>
        );
      })
    ) : (
      <Link href={"/shop"}>
        <MenuItem sx={{ px: 1, fontSize: 14 }}>{t("shop.add")}</MenuItem>
      </Link>
    );
  }

  return (
    <Menu
      id="shop-menu"
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      onClick={handleClose}
      transitionDuration={200}
      slotProps={{
        paper: {
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            bgcolor: "background.paper",
            minWidth: 180,
            mt: 1,
            ml: -0.5,
          },
        },
        list: { sx: { padding: 0.5 } },
      }}
      transformOrigin={{ horizontal: "left", vertical: "top" }}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
    >
      <Paper
        elevation={7}
        sx={{
          display: "block",
          position: "absolute",
          top: 0,
          left: 17,
          width: 10,
          height: 10,
          bgcolor: "background.paper",
          transform: "translateY(-50%) rotate(45deg)",
          boxShadow: "none",
          zIndex: 0,
        }}
      />
      <MenuItem selected={!shop} onClick={clearShop} sx={{ px: 1, fontSize: 14 }}>
        <Avatar sx={{ width: 22, height: 22, mr: 1 }}>
          <Store fontSize="small" />
        </Avatar>
        {t("all.shop")}
      </MenuItem>
      {shopsContent}
    </Menu>
  );
};

export default ShopSelect;
