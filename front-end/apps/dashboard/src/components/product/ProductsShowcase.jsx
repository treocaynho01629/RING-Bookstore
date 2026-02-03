import { styled } from "@mui/material/styles";
import { Paper, Rating, Skeleton, Stack, Alert } from "@mui/material";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Star, StarBorder } from "@mui/icons-material";
import Link from "next/link";
import { currencyFormat, numFormat } from "@ring/shared";
import { Title } from "../custom/Components";

//#region styled
const MessageContainer = styled("div")`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TitleContainer = styled("div")`
  padding: 0 ${({ theme }) => theme.spacing(1, 1)};
`;

const Rank = styled("span")`
  font-size: 14px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  aspect-ratio: 1/1;
  margin-right: ${({ theme }) => theme.spacing(2)};
  border-radius: 50%;
  border: 0.5px solid currentColor;

  &.first {
    color: ${({ theme }) => theme.palette.success.light};
  }

  &.second {
    color: ${({ theme }) => theme.palette.warning.light};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;
  }
`;

const ProductContainer = styled("div")`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 ${({ theme }) => theme.spacing(1)};

  ${({ theme }) => theme.breakpoints.up("md_lg")} {
    &.selected {
      border-right: 3px solid ${({ theme }) => theme.palette.primary.main};
    }
  }
`;

const ProductTitle = styled("span")`
  width: 100%;
  font-size: 14px;
  font-weight: 450;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  @supports (-webkit-line-clamp: 1) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 13px;
  }
`;

const StyledLazyImage = styled(LazyLoadImage)`
  display: inline-block;
  height: 45px;
  width: 45px;
  border: 0.5px solid ${({ theme }) => theme.palette.action.focus};
`;

const StyledSkeleton = styled(Skeleton)`
  display: inline-block;
  height: 45px;
  width: 45px;
`;

const ItemContainer = styled("div")`
  width: 100%;
  display: flex;
  align-items: center;
`;

const ItemInfo = styled("div")`
  display: flex;
  flex-direction: column;
  position: relative;
  flex-grow: 1;
  margin-left: 10px;
`;

const MoreInfo = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Stat = styled("div")`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const TextMore = styled("b")`
  margin-left: 5px;
  padding-left: 5px;
  font-size: 12px;
  color: ${({ theme }) => theme.palette.info.main};

  &:last-of-type {
    border-left: 0.5px solid ${({ theme }) => theme.palette.action.focus};
  }
`;

const StyledRating = styled(Rating)`
  font-size: 14px;
  display: flex;
  align-items: center;
`;

const ProductShop = styled("span")`
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.secondary};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;
  }
`;
//#endregion

const ProductItem = ({ book }) => {
  return (
    <ItemContainer>
      {book ? (
        <StyledLazyImage
          // src={book?.image?.srcSet[ImageSize?.SMALL?.value]}
          alt={`Top item: ${book?.title}`}
          placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
        />
      ) : (
        <StyledSkeleton variant="rectangular" animation={false} />
      )}
      <ItemInfo>
        <ProductTitle>
          {book ? (
            book?.title
          ) : (
            <>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="60%" />
            </>
          )}
        </ProductTitle>
        <MoreInfo>
          {book ? (
            <>
              <ProductShop>{currencyFormat.format(book?.price)}</ProductShop>
              <Stat>
                <StyledRating
                  name="product-rating"
                  value={book?.rating ?? 0}
                  getLabelText={(value) => `${value} Star${value !== 1 ? "s" : ""}`}
                  precision={0.5}
                  icon={<Star style={{ fontSize: 14 }} />}
                  emptyIcon={<StarBorder style={{ fontSize: 14 }} />}
                  readOnly
                />
                <TextMore>Đã bán {numFormat.format(book?.totalOrders)}</TextMore>
              </Stat>
            </>
          ) : (
            <>
              <ProductShop>
                <Skeleton variant="text" width="100px" />
              </ProductShop>
              <Stat>
                <TextMore>
                  <Skeleton variant="text" width="55px" />
                </TextMore>
                <TextMore>
                  <Skeleton variant="text" width="50px" />
                </TextMore>
              </Stat>
            </>
          )}
        </MoreInfo>
      </ItemInfo>
    </ItemContainer>
  );
};

const ProductsShowcase = ({ title, size = 5, data, isError, isLoading, isSuccess }) => {
  const tempProducts = [...Array(size)].map((item, index) => (
    <ProductContainer key={`temp-top-${index}`}>
      <Rank className={index == 0 ? "first" : index == 1 ? "second" : ""}>
        <b>{index + 1}</b>
      </Rank>
      <ProductItem />
    </ProductContainer>
  ));

  let products;

  if (isLoading) {
    products = tempProducts;
  } else if (isSuccess) {
    const { ids, entities } = data;

    products = ids?.length ? (
      ids?.map((id, index) => {
        const book = entities[id];
        return (
          <Link href={`/product/${id}`} key={`top-${id}-${index}`} style={{ textDecoration: "none", color: "inherit" }}>
            <ProductContainer>
              <Rank className={index == 0 ? "first" : index == 1 ? "second" : ""}>{index + 1}</Rank>
              <ProductItem book={book} />
            </ProductContainer>
          </Link>
        );
      })
    ) : (
      <MessageContainer>
        <Alert severity="warning">Không có sản phẩm nào</Alert>
      </MessageContainer>
    );
  } else {
    products = tempProducts;
  }

  return (
    <Paper elevation={3} sx={{ padding: 1, height: "100%" }}>
      <TitleContainer>
        <Title>{title}</Title>
      </TitleContainer>
      <Stack spacing={2} pb={1}>
        {products}
      </Stack>
    </Paper>
  );
};

export default ProductsShowcase;
