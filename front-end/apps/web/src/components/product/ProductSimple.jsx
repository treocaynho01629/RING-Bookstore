import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Skeleton, Button } from "@mui/material";
import { currencyFormat } from "@ring/shared/utils/convert";
import { getImageSrc } from "@ring/shared/enums/image";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import useCart from "../../hooks/useCart";

//#region styled
const Container = styled.div`
  max-width: 290px;
  height: 100%;
  width: 100%;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.hover};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  margin: 0 ${({ theme }) => theme.spacing(0.1)};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${({ theme }) => theme.vars.palette.action.focus};
      box-shadow: ${({ theme }) => theme.shadows[1]};
    }
  }
`;

const Info = styled.div`
  width: 100%;
  z-index: 4;
`;

const Title = styled("h5")`
  width: 100%;
  font-size: 14px;
  margin: 0;
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

const Price = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.vars.palette.primary.main};
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 14px;
  }
`;

const Percentage = styled.span`
  padding: 1px 5px;
  margin-left: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.vars.palette.text.primary};
  background-color: ${({ theme }) => theme.vars.palette.action.focus};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-left: 5px;
    font-size: 10px;
  }
`;

const StyledLazyImage = styled(LazyLoadImage)`
  aspect-ratio: 1/1;
  height: 160px;
  object-fit: contain;
  margin: 5px 0;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin: 0;
  }
`;

const ImgContainer = styled.div`
  width: 100%;
  max-height: 160px;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledSkeleton = styled(Skeleton)`
  height: 100%;
  aspect-ratio: 1/1;
  margin: 5px 0;
`;
//#endregion

const ProductSimple = ({ book, scrollPosition }) => {
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
    <Container>
      {book ? (
        <Link to={`/product/${book?.slug}`} style={{ width: "100%" }}>
          <ImgContainer>
            <StyledLazyImage
              src={getImageSrc(book?.srcSet, 200)}
              alt={`${book?.title} Thumbnail`}
              width={"100%"}
              scrollPosition={scrollPosition}
              placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
            />
          </ImgContainer>
          <Info>
            <Price>
              {currencyFormat.format(book.price)}
              {book.discount > 0 && <Percentage>-{book.discount * 100}%</Percentage>}
            </Price>
            <Title>{book.title}</Title>
          </Info>
        </Link>
      ) : (
        <div style={{ width: "100%" }}>
          <ImgContainer>
            <StyledSkeleton variant="rectangular" />
          </ImgContainer>
          <Info>
            <Price>
              <Skeleton variant="text" width="60%" />
            </Price>
            <Title>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="50%" />
            </Title>
          </Info>
        </div>
      )}
      <Button
        disabled={!book}
        size="small"
        variant="outlined"
        color="secondary"
        onClick={() => handleAddToCart(book)}
        sx={{
          marginBottom: "10px",
          marginTop: "10px",
          padding: "6px 0",
          width: "93%",
          textTransform: "uppercase",
        }}
        startIcon={<ShoppingCartIcon />}
      >
        {t("cart.add")}
      </Button>
    </Container>
  );
};

export default ProductSimple;
