import styled from "@emotion/styled";
import { LazyLoadImage, trackWindowScroll } from "react-lazy-load-image-component";
import { currencyFormat, numFormat } from "@ring/shared/utils/convert";
import { getImageSrc } from "@ring/shared/enums/image";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Message } from "@ring/ui/Components";
import { capitalize } from "lodash-es";
import { useTranslation } from "react-i18next";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import StarRounded from "@mui/icons-material/StarRounded";
import Rating from "@mui/material/Rating";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Progress from "@ring/ui/Progress";

//#region styled
const Container = styled.div`
  display: flex;
  position: relative;
`;

const MessageContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Rank = styled.span`
  display: grid;
  place-content: center;
  padding: 5px;

  * {
    grid-area: 1 / 1;
    width: 50px;
    height: 50px;
  }

  b {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.vars.palette.grey[900]};
    z-index: 1;
  }

  svg {
    font-size: 40px;
    color: ${({ theme }) => theme.vars.palette.grey[400]};
  }

  &.first {
    svg {
      color: ${({ theme }) => theme.vars.palette.success.light};
    }
  }

  &.second {
    svg {
      color: ${({ theme }) => theme.vars.palette.warning.light};
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;

    * {
      width: 40px;
      height: 40px;
    }
  }
`;

const ProductContainer = styled.div`
  display: flex;
  cursor: pointer;
  padding-right: ${({ theme }) => theme.spacing(1)};

  ${({ theme }) => theme.breakpoints.up("md_lg")} {
    &.selected {
      border-right: 3px solid ${({ theme }) => theme.vars.palette.primary.main};
    }
  }
`;

const DisplayContainer = styled.div`
  width: 110%;
  padding: ${({ theme }) => theme.spacing(1)};
  border-left: 0.5px solid ${({ theme }) => theme.vars.palette.divider};

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    display: none;
  }
`;

const Display = styled.div`
  position: relative;
  display: flex;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};
`;

const InfoWrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) =>
    `color-mix(in srgb, ${theme.vars.palette.background.default}, 
      transparent 50%)`};
`;

const ProductTitle = styled.span`
  width: 100%;
  font-size: 14px;
  font-weight: 450;
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

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 13px;
  }
`;

const DisplayTitle = styled.p`
  font-size: 18px;
  font-weight: 450;
`;

const StyledLazyImage = styled(LazyLoadImage)`
  display: inline-block;
  height: 90px;
  width: 90px;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.action.focus};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 80px;
    width: 80px;
  }
`;

const StyledSkeleton = styled(Skeleton)`
  display: inline-block;
  height: 90px;
  width: 90px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 80px;
    width: 80px;
  }
`;

const StyledDisplayLazyImage = styled(LazyLoadImage)`
  display: inline-block;
  object-fit: contain;
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
  max-height: 480px;
`;

const StyledDisplaySkeleton = styled(Skeleton)`
  display: inline-block;
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
  max-height: 480px;
`;

const Price = styled.span`
  font-size: 18px;
  font-weight: 420;
  color: ${({ theme }) => theme.vars.palette.primary.main};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  justify-content: space-between;
`;

const DiscountContainer = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  display: flex;
  align-items: center;
`;

const Discount = styled.p`
  margin-top: 0;
  margin-bottom: 0;
  text-decoration: line-through;
`;

const Percentage = styled.span`
  padding: 2px 5px;
  margin-left: 10px;
  font-size: 14px;
  font-weight: bold;
  background-color: ${({ theme }) =>
    `color-mix(in srgb, ${theme.vars.palette.success.light}, 
      transparent 20%)`};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-left: 5px;
    font-size: 10px;
  }
`;

const Description = styled.div`
  height: 200px;
  font-size: 15px;
  overflow-y: scroll;
  scrollbar-color: ${({ theme }) => theme.vars.palette.action.disabled} transparent;
  scrollbar-width: thin;
`;

const ItemContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  flex-grow: 1;
  margin-left: 10px;
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
  color: ${({ theme }) => theme.vars.palette.info.main};
`;

const StyledRating = styled(Rating)`
  font-size: 14px;
  display: flex;
  align-items: center;
`;

const ProductShop = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.vars.palette.text.secondary};

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;
  }
`;
//#endregion

const TopItem = ({ book, scrollPosition }) => {
  const { t } = useTranslation();
  return (
    <ItemContainer>
      {book ? (
        <StyledLazyImage
          src={getImageSrc(book?.srcSet, 90)}
          alt={`Top item: ${book?.title}`}
          scrollPosition={scrollPosition}
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
        <ProductShop>{book ? `Shop: ${book?.shopName}` : <Skeleton variant="text" width="30%" />}</ProductShop>
        {book ? (
          <MoreInfo>
            <StyledRating
              name="product-rating"
              value={book?.rating ?? 0}
              getLabelText={(value) => `${value} Star${value !== 1 ? "s" : ""}`}
              precision={0.5}
              icon={<Star style={{ fontSize: 14 }} />}
              emptyIcon={<StarBorder style={{ fontSize: 14 }} />}
              readOnly
            />
            <TextMore>
              {t("sold")} {numFormat.format(book?.totalOrders)}
            </TextMore>
          </MoreInfo>
        ) : (
          <Skeleton variant="text" width="40%" />
        )}
      </ItemInfo>
    </ItemContainer>
  );
};

const tempProduct = (
  <Display>
    <StyledDisplaySkeleton variant="rectangular" animation={false} />
    <InfoWrapper>
      <DisplayTitle>
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
      </DisplayTitle>
      <ProductShop>
        <Skeleton variant="text" width="30%" />
      </ProductShop>
      <Price>
        <Skeleton variant="text" width="15%" />
      </Price>
      <DiscountContainer>
        <Skeleton variant="text" width="20%" />
      </DiscountContainer>
      <Description>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
      </Description>
    </InfoWrapper>
  </Display>
);

const ProductsTop = ({
  data,
  isError,
  isLoading,
  isFetching,
  isSuccess,
  isUninitialized = false,
  size = 5,
  scrollPosition,
}) => {
  const { t } = useTranslation();
  const loading = isLoading || isFetching || isError || isUninitialized;
  const [selected, setSelected] = useState(data?.ids[0] ?? -1);

  useEffect(() => {
    setSelected(data?.ids[0] ?? -1);
  }, [data]);

  const tempProducts = [...Array(size)].map((item, index) => (
    <ProductContainer key={`temp-top-${index}`}>
      <Rank className={index == 0 ? "first" : index == 1 ? "second" : ""}>
        <b>{index + 1}</b>
        <StarRounded />
      </Rank>
      <TopItem />
    </ProductContainer>
  ));

  let products;
  let product;

  if (loading) {
    products = tempProducts;
    product = tempProduct;
  } else if (isSuccess) {
    const { ids, entities } = data;
    const selectedBook = entities[selected];

    products = ids?.length ? (
      ids?.map((id, index) => {
        const book = entities[id];
        return (
          <Link to={`/product/${book?.slug}`} key={`top-${id}-${index}`}>
            <ProductContainer className={selected == id ? "selected" : ""} onMouseEnter={() => setSelected(id)}>
              <Rank className={index == 0 ? "first" : index == 1 ? "second" : ""}>
                <b>{index + 1}</b>
                <StarRounded />
              </Rank>
              <TopItem {...{ book, scrollPosition }} />
            </ProductContainer>
          </Link>
        );
      })
    ) : (
      <MessageContainer>
        <Message color="warning">{capitalize(t("message.no", { item: t("product.label") }))}</Message>
      </MessageContainer>
    );

    product = selectedBook ? (
      <Link to={`/product/${selectedBook?.slug}`}>
        <Display>
          <StyledDisplayLazyImage
            src={getImageSrc(selectedBook?.srcSet, 600)}
            srcSet={Object.entries(selectedBook?.srcSet)
              .map(([key, value]) => `${value} ${key}w`)
              .join(", ")}
            sizes="(min-width: 450px) 450px, 100vw"
            alt={`${selectedBook?.title} showcase image`}
            scrollPosition={scrollPosition}
            placeholder={<StyledDisplaySkeleton variant="rectangular" animation={false} />}
          />
          <InfoWrapper>
            <DisplayTitle>{selectedBook?.title}</DisplayTitle>
            <ProductShop>{selectedBook?.shopName}</ProductShop>
            <Price>{currencyFormat.format(selectedBook?.price * (1 - selectedBook?.discount))}</Price>
            <DiscountContainer>
              {selectedBook?.discount > 0 ? (
                <>
                  <Discount>{currencyFormat.format(selectedBook?.price)}</Discount>
                  <Percentage>-{selectedBook?.discount * 100}%</Percentage>
                </>
              ) : (
                <span>&nbsp;</span>
              )}
            </DiscountContainer>
            <Description>{selectedBook?.description}</Description>
          </InfoWrapper>
        </Display>
      </Link>
    ) : (
      tempProduct
    );
  } else {
    products = tempProducts;
    product = tempProduct;
  }

  return (
    <Container>
      {loading && <Progress color={`${isError || isUninitialized ? "error" : "primary"}`} />}
      <Stack spacing={1} sx={{ py: 1, width: "100%" }}>
        {products}
      </Stack>
      <DisplayContainer>{product}</DisplayContainer>
    </Container>
  );
};

export default trackWindowScroll(ProductsTop);
