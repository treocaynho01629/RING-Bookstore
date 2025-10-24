import { Store } from "@mui/icons-material";
import { Avatar, Menu, MenuItem, Paper } from "@mui/material";
import { Link } from "react-router";

const ShopSelect = ({ open, anchorEl, handleClose, shop, setShop, data }) => {
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
            selected={id == shop}
            onClick={() => setShop(id)}
            sx={{ px: 1, fontSize: 14 }}
          >
            <Avatar
              src={shopEntity?.image ?? null}
              sx={{ width: 22, height: 22, mr: 1 }}
            >
              <Store fontSize="small" />
            </Avatar>
            {shopEntity?.name}
          </MenuItem>
        );
      })
    ) : (
      <Link to={"/shop"}>
        <MenuItem sx={{ px: 1, fontSize: 14 }}>Thêm cửa hàng</MenuItem>
      </Link>
    );
  }

  return (
    <Menu
      id="shop-menu"
      open={open}
      value={shop}
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
      <MenuItem
        selected={!shop}
        onClick={() => setShop("")}
        sx={{ px: 1, fontSize: 14 }}
      >
        <Avatar sx={{ width: 22, height: 22, mr: 1 }}>
          <Store fontSize="small" />
        </Avatar>
        Tổng thể
      </MenuItem>
      {shopsContent}
    </Menu>
  );
};

export default ShopSelect;
