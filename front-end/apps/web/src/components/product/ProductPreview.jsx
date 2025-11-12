import styled from "@emotion/styled";
import { Link } from "react-router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { currencyFormat } from "@ring/shared/utils/convert";
import { getImageSize } from "@ring/shared/enums/image";
import Skeleton from "@mui/material/Skeleton";

//#region styled
const Container = styled.div`
  max-width: 200px;
  width: 100%;
  height: 100%;
  padding: 10px;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.background.paper};
  margin: ${({ theme }) => theme.spacing(0.1)} 0;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${({ theme }) => theme.vars.palette.action.focus};
      box-shadow: ${({ theme }) => theme.shadows[1]};
    }
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    min-width: 142px;
    padding: 0 4px 4px;
    margin: 0 ${({ theme }) => theme.spacing(0.1)};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    min-width: 110px;
    max-width: 120px;
    padding: 0;
  }
`;

const Info = styled.div`
  width: 100%;
  z-index: 4;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 0 5px 5px;
  }
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

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;
  }
`;

const Price = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.vars.palette.primary.main};
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    font-size: 12px;
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
    padding: 1px 2px;
    font-size: 9px;
  }
`;

const StyledLazyImage = styled(LazyLoadImage)`
  max-height: 140px;
  aspect-ratio: 1/1;
  z-index: -3;
  object-fit: contain;
`;

const SkeletonContainer = styled.div`
  width: 100%;
  max-height: 140px;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledSkeleton = styled(Skeleton)`
  height: 100%;
  aspect-ratio: 1/1;
`;
//#endregion

const ImageSize = getImageSize();

const ProductPreview = ({ book, scrollPosition }) => {
  return (
    <Container>
      {book ? (
        <Link to={`/product/${book?.slug}`} style={{ width: "100%" }}>
          <StyledLazyImage
            src={book?.image?.srcSet[ImageSize?.SMALL?.value]}
            alt={`${book?.title} Thumbnail`}
            width={"100%"}
            scrollPosition={scrollPosition}
            placeholder={
              <SkeletonContainer>
                <StyledSkeleton variant="rectangular" animation={false} />
              </SkeletonContainer>
            }
          />
          <Info>
            <Title>{book.title}</Title>
            <Price>
              {currencyFormat.format(book.price)}
              {book.discount > 0 && <Percentage>-{book.discount * 100}%</Percentage>}
            </Price>
          </Info>
        </Link>
      ) : (
        <>
          <SkeletonContainer>
            <Skeleton variant="rectangular" height={"100%"} sx={{ aspectRatio: "1/1" }} />
          </SkeletonContainer>
          <Info>
            <Skeleton variant="text" sx={{ fontSize: "16px" }} width="100%" />
            <Skeleton variant="text" sx={{ fontSize: "16px" }} width="50%" />
            <Skeleton variant="text" sx={{ fontSize: "20px" }} width="60%" />
          </Info>
        </>
      )}
    </Container>
  );
};

export default ProductPreview;
