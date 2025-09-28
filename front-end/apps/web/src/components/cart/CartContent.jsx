import styled from "@emotion/styled";
import {
  useEffect,
  useMemo,
  useState,
  Suspense,
  lazy,
  useCallback,
  useRef,
} from "react";
import { Link, useNavigate } from "react-router";
import { booksApiSlice } from "../../features/books/booksApiSlice";
import { useCalculateMutation } from "../../features/orders/ordersApiSlice";
import { debounce, isEqual } from "lodash-es";
import { useGetRecommendCouponsQuery } from "../../features/coupons/couponsApiSlice";
import {
  ActionTableCell,
  StyledTableCell,
  StyledTableHead,
} from "../custom/TableComponents";
import { StyledCheckbox } from "../custom/CartComponents";
import useDeepEffect from "@ring/shared/useDeepEffect";
import useAuth from "../../hooks/useAuth";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Search from "@mui/icons-material/Search";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import Sell from "@mui/icons-material/Sell";
import useCart from "../../hooks/useCart";
import CheckoutDialog from "./CheckoutDialog";
import PropTypes from "prop-types";
import CartDetailRow from "./CartDetailRow";
import useCheckout from "../../hooks/useCheckout";

const Menu = lazy(() => import("@mui/material/Menu"));
const CouponDialog = lazy(() => import("../coupon/CouponDialog"));
const ConfirmDialog = lazy(() => import("@ring/shared/ConfirmDialog"));

//#region styled
const TitleContainer = styled.div`
  position: relative;
  padding: 20px 0px;

  &.end {
    text-align: end;
    direction: rtl;

    ${({ theme }) => theme.breakpoints.down("md_lg")} {
      display: none;
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 20px 10px;
  }
`;

const Title = styled.h3`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
`;

const StyledDeleteButton = styled(Button)`
  position: absolute;
  right: 8px;
  background-color: transparent;
  z-index: 1;
  visibility: visible;
  transition: all 0.2s ease;

  &.hidden {
    opacity: 0;
    visibility: hidden;
  }
`;
//#endregion

function EnhancedTableHead({
  onSelectAllClick,
  numSelected,
  rowCount,
  handleDeleteMultiple,
}) {
  let isIndeterminate = numSelected > 0 && numSelected < rowCount;
  let isSelectedAll = rowCount > 0 && numSelected === rowCount;

  return (
    <StyledTableHead>
      <TableRow
        className="header"
        role="select-all-checkbox"
        aria-checked={isIndeterminate || isSelectedAll}
        selected={isIndeterminate || isSelectedAll}
        sx={{
          backgroundColor: { xs: "background.default", sm: "action.hover" },
        }}
      >
        <StyledTableCell padding="checkbox" sx={{ width: "40px" }}>
          <StyledCheckbox
            indeterminate={isIndeterminate}
            checked={isSelectedAll}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "Select all" }}
          />
        </StyledTableCell>
        <StyledTableCell align="left">
          Chọn tất cả ({rowCount} sản phẩm)
        </StyledTableCell>
        <StyledTableCell
          align="left"
          className={numSelected > 0 ? "hidden" : ""}
          sx={{
            width: "100px",
            display: {
              xs: "none",
              md: "table-cell",
              md_lg: "none",
              lg: "table-cell",
            },
          }}
        >
          Đơn giá
        </StyledTableCell>
        <StyledTableCell
          align="center"
          className={numSelected > 0 ? "hidden" : ""}
          sx={{
            width: "140px",
            display: { xs: "none", sm: "table-cell" },
          }}
        >
          Số lượng
        </StyledTableCell>
        <StyledTableCell
          align="left"
          className={numSelected > 0 ? "hidden" : ""}
          sx={{
            width: "100px",
            display: { xs: "none", md: "table-cell" },
          }}
        >
          Tổng
        </StyledTableCell>
        <ActionTableCell>
          <StyledDeleteButton
            className={numSelected > 0 ? "" : "hidden"}
            color="error"
            endIcon={<DeleteIcon />}
            disableRipple
            onClick={handleDeleteMultiple}
          >
            Xoá
          </StyledDeleteButton>
        </ActionTableCell>
      </TableRow>
    </StyledTableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  handleDeleteMultiple: PropTypes.func.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const CartContent = ({ confirm }) => {
  const {
    cartProducts,
    removeProduct,
    clearCart,
    decreaseAmount,
    increaseAmount,
    changeAmount,
  } = useCart();
  const prevPayload = useRef();
  const { estimateCart, syncCart } = useCheckout();
  const { username } = useAuth();
  const [selected, setSelected] = useState([]);
  const [shopIds, setShopIds] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [shopCoupon, setShopCoupon] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [shopDiscount, setShopDiscount] = useState([]);
  const [checkState, setCheckState] = useState(null);

  //Dialog/Menu
  const [contextProduct, setContextProduct] = useState(null);
  const [contextShop, setContextShop] = useState(null);
  const [contextState, setContextState] = useState(null);
  const [contextCoupon, setContextCoupon] = useState(null);
  const [openDialog, setOpenDialog] = useState(undefined);
  const [openWarning, setOpenWarning] = useState(undefined);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  //Recommend coupons
  const {
    data: recommend,
    isLoading: loadRecommend,
    isSuccess: doneRecommend,
    isError: errorRecommend,
  } = useGetRecommendCouponsQuery({ shopIds }, { skip: !shopIds.length });

  //For get similar
  const [getBook] = booksApiSlice.useLazyGetBookDetailQuery();

  //Estimate/calculate price
  const [estimated, setEstimated] = useState({
    deal: 0,
    subTotal: 0,
    shipping: 0,
    total: 0,
  });
  const [calculated, setCalculated] = useState(null);
  const [calculate, { isLoading: calculating }] = useCalculateMutation();

  //#region construct
  useDeepEffect(() => {
    if (
      calculating ||
      !selected.length ||
      !cartProducts?.length ||
      cartProducts.length == 0
    ) {
      handleCalculate.cancel();
    }
    handleCartChange();
  }, [selected, cartProducts, shopCoupon, coupon]);

  //Set recommend coupons
  useEffect(() => {
    if (recommend && !loadRecommend && doneRecommend) {
      const { ids, entities } = recommend;

      ids.forEach((id) => {
        const coupon = entities[id];

        if (coupon?.shopId) {
          setShopCoupon((prev) => ({ ...prev, [coupon?.shopId]: coupon }));
        } else {
          setCoupon(coupon);
        }
      });
    }
  }, [recommend, loadRecommend]);

  const handleCartChange = () => {
    if (selected.length > 0 && cartProducts.length > 0) {
      //Reduce cart
      const selectedCart = cartProducts.reduce(
        (result, item) => {
          const { id, shopId } = item;

          if (selected.indexOf(id) !== -1) {
            //Get selected items in redux store
            //Find or create shop
            let detail = result.cart.find(
              (shopItem) => shopItem.shopId === shopId
            );

            if (!detail) {
              detail = { shopId, coupon: shopCoupon[shopId]?.code, items: [] };
              result.cart.push(detail);
            }

            //Add items for that shop
            detail.items.push(item);
          }

          return result;
        },
        { coupon: coupon?.code, cart: [] }
      );

      handleEstimate(selectedCart); //Estimate price
      if (doneRecommend || errorRecommend) handleCalculate(selectedCart); //Calculate price
    } else {
      //Reset
      handleEstimate(null);
      handleCalculate(null);
      setCalculated(null);
    }
  };

  const handleClearSelect = useCallback(() => {
    setSelected([]);
    setCalculated(null);
  }, []);

  //Estimate before receive caculated price from server
  const handleEstimate = useCallback(
    (cart) => {
      const result = estimateCart(cart);
      setCheckState(result.checkState);
      setEstimated(result.estimated);
    },
    [cartProducts]
  );

  //Calculate server side
  const handleCalculate = useCallback(
    debounce(async (cart) => {
      if (
        calculating ||
        cart == null ||
        isEqual(prevPayload.current, cart) ||
        !username
      )
        return;

      calculate(cart)
        .unwrap()
        .then((data) => {
          setCalculated(data);
          handleSyncCart(data);
          prevPayload.current = cart;
        })
        .catch((err) => {
          console.error(err);
          if (!err?.status) {
            console.error("Server không phản hồi!");
          } else if (err?.status === 409) {
            console.error(err?.data?.message);
          } else if (err?.status === 400) {
            console.error("Sai định dạng giỏ hàng!");
          } else {
            console.error("Tính trước đơn hàng thất bại!");
          }
        });
    }, 500),
    []
  );

  //Sync cart between client and server
  const handleSyncCart = (cart) => {
    syncCart(
      cart,
      setDiscount,
      setShopDiscount,
      coupon,
      setCoupon,
      shopCoupon,
      setShopCoupon,
      handleOpenWarning
    );
  };

  //Separate by shop
  const reduceCart = () => {
    let shopIds = [];
    let resultCart = cartProducts.reduce((result, item) => {
      if (!result[item.shopId]) {
        //Check if not exists shop >> Add new one
        result[item.shopId] = { shopName: item.shopName, products: [] };
        shopIds.push(item.shopId);
      }

      //Else push
      result[item.shopId].products.push(item);
      return result;
    }, {});

    setShopIds(shopIds);
    return resultCart;
  };
  const reducedCart = useMemo(() => reduceCart(), [cartProducts]);
  const displayInfo = {
    deal:
      calculating || !calculated ? estimated?.deal : calculated?.dealDiscount,
    subTotal:
      calculating || !calculated
        ? estimated?.subTotal
        : calculated?.productsTotal,
    shipping:
      calculating || !calculated
        ? estimated?.shipping
        : calculated?.shippingFee,
    couponDiscount: calculated?.couponDiscount || 0,
    totalDiscount: calculated?.totalDiscount || 0,
    shippingDiscount: calculated?.shippingDiscount || 0,
    total:
      calculating || !calculated
        ? estimated?.total
        : calculated?.total - calculated?.totalDiscount,
  };

  //Open context menu
  const handleClick = (e, product) => {
    setAnchorEl(e.currentTarget);
    setContextProduct(product);
  };

  const handleOpenWarning = () => {
    setOpenWarning(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setContextProduct(null);
  };

  const handleOpenDialog = (shopId) => {
    setOpenDialog(true);
    setContextShop(shopId);
    setContextState(
      shopId
        ? checkState?.details[shopId]
        : { value: checkState?.value, quantity: checkState?.quantity }
    );
    setContextCoupon(shopId ? shopCoupon[shopId] : coupon);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseWarning = () => {
    setOpenWarning(false);
  };

  //Selected?
  const isShopSelected = (shop) =>
    shop?.products.some((product) => selected.includes(product.id));
  const isSelected = (id) => selected.indexOf(id) !== -1;

  //Select all checkboxes
  const handleSelectAllClick = (e) => {
    if (e.target.checked) {
      const newSelected = cartProducts?.map((item) => {
        if (item.amount > 0) return item.id;
      });
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  //Select item
  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleDeselect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  //Select shop
  const handleSelectShop = (shop) => {
    let newSelected = [];
    let disabled = [];
    const notSelected = shop?.products
      .filter((product) => !selected.includes(product.id))
      .map((product) => {
        if (product.amount > 0) {
          return product.id;
        } else {
          disabled.push(product.id);
        }
      });

    if (notSelected.length <= disabled.length) {
      const alreadySelected = shop?.products
        .filter((product) => selected.includes(product.id))
        .map((product) => product.id);
      newSelected = selected.filter((id) => !alreadySelected.includes(id));
    } else {
      newSelected = newSelected.concat(selected, notSelected);
    }
    setSelected(newSelected);
  };

  //Delete
  const handleDeleteContext = () => {
    handleDelete(contextProduct?.id);
    handleClose();
  };

  const handleDelete = async (id) => {
    if (isSelected(id)) handleSelect(id);
    const confirmation = await confirm();
    if (confirmation) {
      removeProduct(id);
      handleClose();
    } else {
      console.log("Cancel");
    }
  };

  const handleDecrease = async (quantity, id) => {
    if (quantity == 1) {
      if (isSelected(id)) handleSelect(id); //Unselect if remove

      const confirmation = await confirm();
      if (confirmation) {
        decreaseAmount(id);
      } else {
        console.log("Cancel");
      }
    } else {
      decreaseAmount(id);
    }
  };

  const handleChangeQuantity = (quantity, id) => {
    if (quantity < 1 && isSelected(id)) handleSelect(id); //Unselect if remove
    changeAmount({ quantity, id });
  };

  const handleDeleteMultiple = async () => {
    const confirmation = await confirm();
    if (confirmation) {
      if (selected.length == cartProducts.length) {
        clearCart();
      } else {
        selected.forEach((id) => {
          removeProduct(id);
        });
      }
      handleCalculate.cancel();
      handleClearSelect();
    } else {
      console.log("Cancel");
    }
  };

  const handleFindSimilar = async () => {
    getBook({ id: contextProduct?.id })
      .unwrap()
      .then((book) => {
        navigate(`/store/${book?.category?.slug}
                ?cate=${book?.category?.id}
                &pubs=${book?.publisher?.id}
                &types=${book?.type}`);
      })
      .catch((rejected) => console.error(rejected));
    handleClose();
  };

  const handleChangeCoupon = (coupon, shopId) => {
    if (shopId) {
      setShopCoupon((prev) => ({ ...prev, [shopId]: coupon }));
    } else {
      setCoupon(coupon);
    }
  };
  //#endregion

  return (
    <Grid
      container
      spacing={2}
      sx={{ position: "relative", mb: 10, justifyContent: "flex-end" }}
    >
      <Grid size={{ xs: 12, md_lg: 8 }} position="relative">
        <TitleContainer>
          <Title>
            <ShoppingCartIcon />
            &nbsp;GIỎ HÀNG ({cartProducts?.length})
          </Title>
        </TitleContainer>
        <Table aria-label="cart-table">
          <EnhancedTableHead
            numSelected={selected.length}
            onSelectAllClick={handleSelectAllClick}
            handleDeleteMultiple={handleDeleteMultiple}
            rowCount={cartProducts?.length}
          />
          <TableBody>
            {Object.keys(reducedCart).map((shopId, index) => {
              const shop = { ...reducedCart[shopId], id: shopId };
              const isGroupSelected = isShopSelected(shop);

              return (
                <CartDetailRow
                  key={`detail-${shopId}-${index}`}
                  {...{
                    shop,
                    isSelected,
                    isGroupSelected,
                    handleSelect,
                    handleDeselect,
                    handleSelectShop,
                    coupon: shopCoupon[shopId],
                    discount: shopDiscount[shopId],
                    handleDecrease,
                    increaseAmount,
                    handleChangeQuantity,
                    handleClick,
                    handleOpenDialog,
                  }}
                />
              );
            })}
          </TableBody>
        </Table>
        <Box mt={1} display="flex">
          <Link to={"/"}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ChevronLeft />}
            >
              Tiếp tục mua sắm
            </Button>
          </Link>
        </Box>
      </Grid>
      <Grid
        size={{ xs: 12, md_lg: 4 }}
        position={{ xs: "sticky", md_lg: "relative" }}
        bottom={0}
      >
        <TitleContainer className="end">
          <Title>
            <Sell />
            &nbsp;ĐƠN DỰ TÍNH
          </Title>
        </TitleContainer>
        <CheckoutDialog
          {...{
            coupon,
            shopCoupon,
            selected,
            discount,
            navigate,
            calculating,
            displayInfo,
            handleOpenDialog,
            loggedIn: username != null,
          }}
        />
      </Grid>
      <Suspense fallback={null}>
        {openDialog !== undefined && (
          <CouponDialog
            {...{
              open: openDialog,
              handleClose: handleCloseDialog,
              shopId: contextShop,
              checkState: contextState,
              numSelected: selected.length,
              selectedCoupon: contextCoupon,
              selectMode: true,
              loggedIn: username != null,
              onSubmit: handleChangeCoupon,
            }}
          />
        )}
      </Suspense>
      <Suspense fallback={null}>
        {open !== undefined && (
          <Menu
            open={open}
            onClose={handleClose}
            slotProps={{
              list: { "aria-labelledby": "basic-button" },
            }}
            anchorEl={anchorEl}
          >
            <MenuItem onClick={handleDeleteContext}>
              <ListItemIcon>
                <DeleteIcon sx={{ color: "error.main" }} fontSize="small" />
              </ListItemIcon>
              <ListItemText sx={{ color: "error.main" }}>
                Xoá khỏi giỏ
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={handleFindSimilar}>
              <ListItemIcon>
                <Search fontSize="small" />
              </ListItemIcon>
              <ListItemText>Tìm sản phẩm tương tự</ListItemText>
            </MenuItem>
          </Menu>
        )}
      </Suspense>
      <Suspense fallback={null}>
        {openWarning !== undefined && (
          <ConfirmDialog
            {...{
              open: openWarning,
              title: "Đã gỡ các sản phẩm!",
              message: "Một số sản phẩm đã bị gỡ khỏi trang!",
              handleConfirm: handleCloseWarning,
            }}
          />
        )}
      </Suspense>
    </Grid>
  );
};

export default CartContent;
