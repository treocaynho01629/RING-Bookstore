import styled from "@emotion/styled";
import { useRef } from "react";
import { Link } from "react-router";
import { useGetPreviewCategoriesQuery } from "../../features/categories/categoriesApiSlice";
import { LazyLoadImage } from "react-lazy-load-image-component";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";

//#region styled
const StyledLazyImage = styled(LazyLoadImage)`
  aspect-ratio: 1/1;
  height: 65px;
  width: 65px;
  object-fit: contain;

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    height: 55px;
    width: 55px;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 45px;
    width: 45px;
  }
`;

const StyledSkeleton = styled(Skeleton)`
  aspect-ratio: 1/1;
  height: 65px;
  width: 65px;

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    height: 55px;
    width: 55px;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    height: 45px;
    width: 45px;
  }
`;

const ItemContainer = styled.div`
  padding-top: 4px;
  width: 100px;
  height: 100%;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0.5px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-1px);
      border-color: ${({ theme }) => theme.vars.palette.action.focus};
      box-shadow: ${({ theme }) => theme.shadows[1]};
      ${StyledLazyImage} {
        filter: saturate(120%);
      }
    }
  }

  ${({ theme }) => theme.breakpoints.down("md_lg")} {
    width: 90px;
    height: 100px;
    font-size: 13px;
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 2px;
    width: 70px;
    height: 95px;
    font-size: 12px;
  }
`;

const CateContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      .button-container {
        opacity: 1;
        visibility: visible;
      }
    }
  }
`;

const ItemWrapper = styled.div`
  display: flex;
  height: 100%;
`;

const ItemName = styled.span`
  margin-top: 5px;
  font-weight: bold;
  text-transform: capitalize;
  width: 100%;
  text-align: center;
`;

const Wrapper = styled.div`
  position: relative;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  overflow-x: scroll;
  scroll-behavior: smooth;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${({ theme }) => theme.breakpoints.up("md")} {
    ${ItemWrapper}:first-of-type {
      margin-left: 20px;
    }
    ${ItemWrapper}:last-of-type {
      margin-right: 40px;
    }
  }
`;

const ButtonContainer = styled.div`
  position: absolute;
  right: 0;
  padding-left: 20px;
  height: 100%;
  background-image: linear-gradient(
    to left,
    ${({ theme }) => theme.vars.palette.background.paper},
    ${({ theme }) => theme.vars.palette.background.paper} 80%,
    transparent 100%
  );
  display: flex;
  align-items: center;
  transition: all 0.25s ease;
  opacity: 0;
  visibility: hidden;
  z-index: 2;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      opacity: 1;
      visibility: visible;
    }
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    display: none;
  }
`;
//#endregion

const Categories = () => {
  const { data: categories, isLoading, isSuccess, isError } = useGetPreviewCategoriesQuery();
  const slideRef = useRef();

  //Scroll
  const scrollSlide = (n) => {
    slideRef.current.scrollLeft += n;
  };

  let catesContent;

  if (isLoading || isError) {
    catesContent = [...Array(15)].map((item, index) => (
      <ItemWrapper key={`cate-${index}`}>
        <ItemContainer>
          <StyledSkeleton variant="rectangular" animation={false} />
          <ItemName>
            <Skeleton variant="text" width="100%" />
            &nbsp;
          </ItemName>
        </ItemContainer>
      </ItemWrapper>
    ));
  } else if (isSuccess) {
    const { ids, entities } = categories;

    catesContent = ids?.length
      ? ids?.map((cateId, index) => {
          const cate = entities[cateId];

          return (
            <ItemWrapper key={`cate-${cateId}-${index}`}>
              <Link to={`/store/${cate?.slug}?cate=${cateId}`} title={cate?.name}>
                <ItemContainer>
                  <StyledLazyImage
                    src={cate?.image}
                    alt={`Category item: ${cate?.name}`}
                    placeholder={<StyledSkeleton variant="rectangular" animation={false} />}
                  />
                  <ItemName>{cate?.name}</ItemName>
                </ItemContainer>
              </Link>
            </ItemWrapper>
          );
        })
      : null;
  }

  return (
    <CateContainer>
      <Wrapper draggable={true} ref={slideRef}>
        {catesContent}
      </Wrapper>
      <ButtonContainer className="button-container">
        <div>
          <IconButton aria-label="Scroll categories to left" onClick={() => scrollSlide(-500)}>
            <KeyboardArrowLeft fontSize="small" />
          </IconButton>
          <IconButton aria-label="Scroll categories to right" onClick={() => scrollSlide(500)}>
            <KeyboardArrowRight fontSize="small" />
          </IconButton>
        </div>
      </ButtonContainer>
    </CateContainer>
  );
};

export default Categories;
