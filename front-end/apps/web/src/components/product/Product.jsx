import styled from "@emotion/styled";
import { Link } from "react-router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { currencyFormat } from "@ring/shared/utils/convert";
import { useTranslation } from "react-i18next";
import { getImageSrc } from "@ring/shared/enums/image";
import { numFormat } from "@ring/shared/utils/convert";
import StarIcon from "@mui/icons-material/Star";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StarBorder from "@mui/icons-material/StarBorder";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Rating from "@mui/material/Rating";
import useCart from "../../hooks/useCart";

//#region styled
const StyledLazyImage = styled(LazyLoadImage)`
  aspect-ratio: 1/1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: filter 0.25s ease;
  z-index: -1;
  background-color: ${({ theme }) => theme.vars.palette.action.disabledBackground};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-bottom: 0;
  }
`;

const StyledSkeleton = styled(Skeleton)`
  aspect-ratio: 1/1;
  width: 100%;
  height: 100%;
`;

const ImageContainer = styled.div`
  aspect-ratio: 1/1;
  width: 100%;
  height: 100%;
  max-height: 180px;
  max-width: 180px;
  margin-bottom: 10px;
`;

const Wrapper = styled.div`
  min-width: 172px;
  min-height: 350px;
  max-width: 290px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  position: relative;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.hover};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  overflow: hidden;
  transition: all 0.25s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${({ theme }) => theme.vars.palette.action.focus};
      box-shadow: ${({ theme }) => theme.shadows[1]};
      ${ImageContainer} {
        filter: saturate(120%);
      }
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    min-height: 317px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const Info = styled.div`
  position: relative;
  width: 94%;
  height: 100%;

  &.extra {
    height: auto;
  }
`;

const MainInfo = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled("h5")`
  width: 100%;
  line-height: 1.5;
  font-size: 14px;
  margin: 0;
  margin-top: 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  @supports (-webkit-line-clamp: 2) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

const PriceContainer = styled.div`
  display: flex;
  margin-bottom: 5px;

  ${({ theme }) => theme.breakpoints.up("sm")} {
    flex-direction: column;
  }
`;

const Price = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.vars.palette.primary.main};
  margin-right: 5px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
  }
`;

const DiscountContainer = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 13px;
  }
`;

const Discount = styled.p`
  margin-top: 0;
  margin-bottom: 0;
  text-decoration: line-through;
`;

const Percentage = styled.span`
  padding: 1px 5px;
  margin-left: 10px;
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.vars.palette.primary.contrastText};
  background-color: ${({ theme }) => theme.vars.palette.primary.main};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-left: 5px;
    font-size: 10px;
  }
`;

const AddToCart = styled.p`
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  transition: all 0.25s ease;
  margin: 9px 0;
  text-transform: uppercase;
  cursor: pointer;

  &.disabled {
    pointer-events: none;
    color: ${({ theme }) => theme.vars.palette.text.disabled};
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme }) => theme.vars.palette.primary.main};
    }
  }
`;

const ProductInfo = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const MoreInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const TextMore = styled.b`
  margin-left: 5px;
  padding-left: 5px;
  font-size: 12px;
  border-left: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};

  &.secondary {
    color: ${({ theme }) => theme.vars.palette.text.secondary};
  }
`;

const StyledRating = styled(Rating)`
  font-size: 14;
  display: flex;
  align-items: center;
`;

const ProductTag = styled.span`
  position: absolute;
  top: ${({ theme }) => theme.spacing(1)};
  left: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(0.25)} ${theme.spacing(1)}`};
  background-color: ${({ theme, color }) => theme.vars.palette[color]?.light || theme.vars.palette.info.light};
  color: ${({ theme, color }) => theme.vars.palette[color]?.contrastText || theme.vars.palette.info.contrastText};
  font-size: 12px;
  font-weight: 500px;
  z-index: 1;
`;
//#endregion

const Product = ({ book, scrollPosition }) => {
  const { addProduct } = useCart();
  const { t } = useTranslation();

  /**
   * Handle add to cart
   * @param {Book} book
   */
  const handleAddToCart = (book) => {
    addProduct(book, 1);
  };

  return (
    <Wrapper>
      <Container>
        {book ? (
          <Link to={`/product/${book.slug}`} style={{ width: "100%", height: "100%" }}>
            <ItemContainer>
              {book?.amount < 30 && (
                <ProductTag color={book?.amount <= 0 ? "error" : "warning"}>
                  {book?.amount <= 0 ? t("cart.items.out") : t("product.out.fast")}
                </ProductTag>
              )}
              <ImageContainer>
                <StyledLazyImage
                  src={getImageSrc(book?.srcSet, 200)}
                  alt={`${book?.title} Thumbnail`}
                  scrollPosition={scrollPosition}
                  placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
                />
              </ImageContainer>
              <Info>
                <MainInfo>
                  <ProductInfo>
                    <Title>{book.title}</Title>
                    <PriceContainer>
                      <Price>{currencyFormat.format(book.price * (1 - book.discount))}</Price>
                      <DiscountContainer>
                        {book.discount > 0 ? (
                          <>
                            <Discount>{currencyFormat.format(book.price)}</Discount>
                            <Percentage>-{book.discount * 100}%</Percentage>
                          </>
                        ) : (
                          <span>&nbsp;</span>
                        )}
                      </DiscountContainer>
                    </PriceContainer>
                  </ProductInfo>
                  <MoreInfo>
                    <StyledRating
                      name="product-rating"
                      value={book?.rating ?? 0}
                      getLabelText={(value) => `${value} Star${value !== 1 ? "s" : ""}`}
                      precision={0.5}
                      icon={<StarIcon style={{ fontSize: 14 }} />}
                      emptyIcon={<StarBorder style={{ fontSize: 14 }} />}
                      readOnly
                    />
                    <TextMore className="secondary">
                      {t("product.sold")} {numFormat.format(book?.totalOrders)}
                    </TextMore>
                  </MoreInfo>
                </MainInfo>
              </Info>
            </ItemContainer>
          </Link>
        ) : (
          <>
            <ImageContainer>
              <StyledSkeleton variant="rectangular" />
            </ImageContainer>
            <Info>
              <MainInfo>
                <ProductInfo>
                  <Title>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                  </Title>
                  <PriceContainer>
                    <Price>
                      <Skeleton variant="text" sx={{ width: { xs: "90%", sm: "40%" } }} />
                    </Price>
                    <DiscountContainer>
                      <Skeleton variant="text" width="60%" />
                    </DiscountContainer>
                  </PriceContainer>
                </ProductInfo>
                <MoreInfo>
                  <Skeleton variant="text" width="70%" />
                </MoreInfo>
              </MainInfo>
            </Info>
          </>
        )}
      </Container>
      <Info className="extra">
        <Divider />
        <AddToCart onClick={() => handleAddToCart(book)} className={book ? "" : "disabled"}>
          <ShoppingCartIcon style={{ fontSize: 14 }} />
          &nbsp;
          {t("cart.add")}
        </AddToCart>
      </Info>
    </Wrapper>
  );
};

export default Product;
