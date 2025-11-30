import styled from "@emotion/styled";
import { Link } from "react-router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useGetRandomBooksQuery } from "../../features/books/booksApiSlice";
import { getImageSrc } from "@ring/shared/enums/image";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Carousel from "react-multi-carousel";
import useCart from "../../hooks/useCart";

//#region styled
const ImgContainer = styled.div`
  height: 430px;
  width: 105%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoWrapper = styled.div`
  position: relative;
  bottom: auto;
  width: 100%;

  ${({ theme }) => theme.breakpoints.down("md")} {
    position: absolute;
    bottom: 0;
    background-color: ${({ theme }) =>
      `color-mix(in srgb, ${theme.vars.palette.background.default}, 
      transparent 50%)`};
  }
`;

const InfoContainer = styled.div`
  padding: 40px 50px;
  align-items: center;
  justify-content: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 40px 20px;
  }
`;

const Title = styled.h2`
  font-size: 30px;
  margin: 25px 0px;
  line-height: normal;
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

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin: 0;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 22px;
  }
`;

const Description = styled.p`
  min-height: 72px;
  margin: 30px 0px;
  font-size: 18px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  @supports (-webkit-line-clamp: 3) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 16px;
  }
`;

const CustomArrowButton = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  border-radius: 50%;
  height: 30px;
  width: 30px;
  font-size: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
  opacity: 0.8;
  z-index: 1;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      opacity: 1;
      transform: scale(1.1);
      background-color: ${({ theme }) => theme.vars.palette.background.default};
    }
  }

  &.left {
    left: 10px;
  }
  &.right {
    right: 10px;
  }

  svg {
    font-size: inherit;
  }
`;

const SlideItemContainer = styled.div`
  position: relative;
  min-height: 450px;
  max-height: 800px;
`;

const StyledLazyImage = styled(LazyLoadImage)`
  aspect-ratio: 1/1;
  object-fit: contain;
`;
//#endregion

const responsive = {
  default: {
    breakpoint: {
      max: 3000,
      min: 900,
    },
    items: 1,
  },
  mobile: {
    breakpoint: {
      max: 900,
      min: 0,
    },
    items: 1,
  },
};

const CustomArrow = ({ onClick, className, direction }) => (
  <CustomArrowButton className={`${className ?? ""} ${direction}`} onClick={onClick}>
    {direction == "left" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
  </CustomArrowButton>
);

function Item({ book, index }) {
  const { addProduct } = useCart();

  const handleAddToCart = (book) => {
    addProduct(book, 1);
  };

  return (
    <SlideItemContainer>
      <Grid container size="grow" sx={{ alignItems: "center", position: "relative" }}>
        <Grid size={{ xs: 12, md: 5 }} mb={{ xs: "100px", md: 0 }}>
          {book ? (
            <Link to={`/product/${book.slug}`}>
              <ImgContainer>
                <StyledLazyImage
                  src={getImageSrc(book?.srcSet, 500)}
                  srcSet={Object.entries(book?.srcSet)
                    .map(([key, value]) => `${value} ${key}w`)
                    .join(", ")}
                  sizes="(min-width: 450px) 450px, 100vw"
                  alt={`${book.title} Big product item`}
                  height={400}
                  width={"100%"}
                  visibleByDefault={index == 0}
                  placeholder={
                    <Skeleton
                      variant="rectangular"
                      height={400}
                      sx={{ width: { xs: "80%", md: "100%" } }}
                      animation={false}
                    />
                  }
                />
              </ImgContainer>
            </Link>
          ) : (
            <ImgContainer>
              <Skeleton variant="rectangular" height={400} sx={{ width: { xs: "80%", md: "100%" } }} />
            </ImgContainer>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <InfoWrapper>
            {book ? (
              <InfoContainer>
                <Link to={`/product/${book.slug}`} style={{ color: "inherit" }}>
                  <Title>{book.title}</Title>
                  <Description>{book.description}</Description>
                </Link>
                <Button variant="contained" color="primary" size="large" onClick={() => handleAddToCart(book)}>
                  Mua ngay
                </Button>
              </InfoContainer>
            ) : (
              <InfoContainer>
                <Skeleton variant="text" sx={{ fontSize: "30px", marginBottom: 1 }} />
                <Skeleton variant="text" sx={{ fontSize: "18px" }} />
                <Skeleton variant="text" sx={{ fontSize: "18px" }} />
                <Skeleton variant="text" sx={{ fontSize: "18px", marginBottom: 1 }} width={"50%"} />
                <Button disabled variant="contained" color="primary" size="large">
                  Mua ngay
                </Button>
              </InfoContainer>
            )}
          </InfoWrapper>
        </Grid>
      </Grid>
    </SlideItemContainer>
  );
}

const BigProductsSlider = () => {
  const { data, isLoading, isSuccess, isError } = useGetRandomBooksQuery({
    amount: 5,
    withDesc: true,
  });

  let productsCarousel;

  if (isLoading || isError) {
    productsCarousel = <Item />;
  } else if (isSuccess) {
    const { ids, entities } = data;

    productsCarousel = ids?.length ? (
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={15000}
        customLeftArrow={<CustomArrow direction="left" />}
        customRightArrow={<CustomArrow direction="right" />}
        removeArrowOnDeviceType={["mobile"]}
        pauseOnHover
        keyBoardControl
        minimumTouchDrag={80}
      >
        {ids?.map((id, index) => {
          const book = entities[id];

          return <Item key={`${id}-${index}`} book={book} index={index} />;
        })}
      </Carousel>
    ) : (
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={15000}
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
        removeArrowOnDeviceType={["mobile"]}
        pauseOnHover
        keyBoardControl
        minimumTouchDrag={80}
      >
        <Item />
      </Carousel>
    );
  }

  return <>{productsCarousel}</>;
};

export default BigProductsSlider;
