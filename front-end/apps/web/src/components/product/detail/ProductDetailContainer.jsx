import styled from "@emotion/styled";
import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useGetBooksQuery } from "../../../features/books/booksApiSlice";
import { MobileExtendButton, Showmore, Title } from "@ring/ui/Components";
import { getBookType, getBookLanguage } from "@ring/shared/enums/book";
import { idFormatter } from "@ring/shared/utils/convert";
import { useTranslation } from "react-i18next";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import ProductsScroll from "../ProductsScroll";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

//#region styled
const DetailContainer = styled.div`
  height: 100%;
  padding: 10px 20px;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 0 12px;
  }
`;

const DrawerContainer = styled.div`
  padding: ${({ theme }) => `0 ${theme.spacing(1.5)}`};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
  border-top: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  position: relative;
  width: 100%;

  &::before {
    content: "";
    position: absolute;
    top: ${({ theme }) => theme.spacing(1)};
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 5px;
    border-radius: 3px;
    background-color: ${({ theme }) => theme.vars.palette.divider};
  }
`;

const ProductsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  border: 0.5px solid ${({ theme }) => theme.vars.palette.divider};
  background-color: ${({ theme }) => theme.vars.palette.background.paper};
`;

const DescriptionContainer = styled.div`
  position: relative;
`;

const Description = styled.p`
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 14px;
  height: auto;
  transition: all 1s ease;

  &.minimize {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-height: 300px;

    @supports (-webkit-line-clamp: 10) {
      overflow: hidden;
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: 10;
      -webkit-box-orient: vertical;
    }

    ${({ theme }) => theme.breakpoints.down("md")} {
      @supports (-webkit-line-clamp: 5) {
        overflow: hidden;
        white-space: initial;
        display: -webkit-box;
        -webkit-line-clamp: 5;
        -webkit-box-orient: vertical;
      }
    }
  }
`;

const InfoTitle = styled.td`
  width: 25%;
  white-space: nowrap;
  display: flex;
`;

const InfoStack = styled.td`
  padding-left: 10px;
`;

const InfoText = styled.p`
  margin: 8px 0;
  font-size: 14px;

  &.secondary {
    color: ${({ theme }) => theme.vars.palette.text.secondary};
  }
`;

const DescTitle = styled.h4`
  margin: 15px 0;
`;

//#endregion

const ProductDetailContainer = ({ loading, book, tabletMode }) => {
  const { t } = useTranslation();

  const descRef = useRef(null);
  const [overflowed, setOverflowed] = useState(false);
  const [minimize, setMinimize] = useState(true);
  const [openDetail, setOpenDetail] = useState(false);

  // Fetch related books
  const {
    data: relatedBooks,
    isLoading: loadRelated,
    isSuccess: doneRelated,
    isError: errorRelated,
    isUninitialized,
  } = useGetBooksQuery(
    {
      cateId: book?.category?.id,
      size: 8,
    },
    { skip: !book?.category?.id }
  );

  useLayoutEffect(() => {
    setMinimize(true);
  }, [book]);

  /**
   * Update showmore button & showmore content overflowed
   */
  useLayoutEffect(() => {
    function updateShowmore() {
      if (descRef.current.offsetHeight < descRef.current.scrollHeight) {
        setOverflowed(true);
      } else {
        if (minimize) setOverflowed(false);
      }
    }

    window.removeEventListener("resize", updateShowmore);
    window.addEventListener("resize", updateShowmore);
    updateShowmore();
    return () => window.removeEventListener("resize", updateShowmore);
  }, [descRef, minimize, book]);

  /**
   * Toggle minimize description
   */
  const toggleMinimize = () => {
    setMinimize((prev) => !prev);
  };

  let details;
  const typeMeta = getBookType(book?.type);
  const languageMeta = getBookLanguage(book?.language);
  const bookSize = `${book?.length} x ${book?.width} x ${book?.height} cm`;

  if (!loading && book) {
    details = (
      <table style={{ width: "100%", marginTop: "25px" }}>
        <tbody>
          <tr>
            <InfoTitle>
              <InfoText className="secondary">{t("product.id")}: </InfoText>
            </InfoTitle>
            <InfoStack>
              <InfoText>{idFormatter(book?.id)}</InfoText>
            </InfoStack>
          </tr>
          <tr>
            <InfoTitle>
              <InfoText className="secondary">{t("product.author")}: </InfoText>
            </InfoTitle>
            <InfoStack>
              <Link to={`/store?q=${book?.author}`}>
                <InfoText>{book?.author}</InfoText>
              </Link>
            </InfoStack>
          </tr>
          <tr>
            <InfoTitle>
              <InfoText className="secondary">{t("publisher.label")}: </InfoText>
            </InfoTitle>
            <InfoStack>
              <Link to={`/store?pubs=${book?.publisher?.id}`}>
                <InfoText>{book?.publisher?.name}</InfoText>
              </Link>
            </InfoStack>
          </tr>
          <tr>
            <InfoTitle>
              <InfoText className="secondary">{t("product.year")}: </InfoText>
            </InfoTitle>
            <InfoStack>
              <InfoText>{new Date(book?.date).getFullYear()}</InfoText>
            </InfoStack>
          </tr>
          <tr>
            <InfoTitle>
              <InfoText className="secondary">{t("language.label")}: </InfoText>
            </InfoTitle>
            <InfoStack>
              <InfoText>{t(languageMeta?.label) ?? t("product.updating")}</InfoText>
            </InfoStack>
          </tr>
          <tr>
            <InfoTitle>
              <InfoText className="secondary">{t("product.weight")}: </InfoText>
            </InfoTitle>
            <InfoStack>
              <InfoText>{book?.weight ? `${book.weight} gr` : t("product.updating")}</InfoText>
            </InfoStack>
          </tr>
          <tr>
            <InfoTitle>
              <InfoText className="secondary">{t("product.size")}: </InfoText>
            </InfoTitle>
            <InfoStack>
              <InfoText>{bookSize.length > 9 ? bookSize : t("product.updating")}</InfoText>
            </InfoStack>
          </tr>
          <tr>
            <InfoTitle>
              <InfoText className="secondary">{t("product.pages")}: </InfoText>
            </InfoTitle>
            <InfoStack>
              <InfoText>{book?.pages ?? t("product.updating")}</InfoText>
            </InfoStack>
          </tr>
          <tr>
            <InfoTitle>
              <InfoText className="secondary">{t("product.type.label")}: </InfoText>
            </InfoTitle>
            <InfoStack>
              <Link to={`/store?types=${book?.type}`}>
                <InfoText>{t(typeMeta?.label)}</InfoText>
              </Link>
            </InfoStack>
          </tr>
        </tbody>
      </table>
    );
  } else {
    details = (
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td>
              <Skeleton variant="text" sx={{ fontSize: "14px", my: "8px" }} width="30%" />
            </td>
          </tr>
          <tr>
            <td>
              <Skeleton variant="text" sx={{ fontSize: "14px", my: "8px" }} width="35%" />
            </td>
          </tr>
          <tr>
            <td>
              <Skeleton variant="text" sx={{ fontSize: "14px", my: "8px" }} width="40%" />
            </td>
          </tr>
          <tr>
            <td>
              <Skeleton variant="text" sx={{ fontSize: "14px", my: "8px" }} width="40%" />
            </td>
          </tr>
          <tr>
            <td>
              <Skeleton variant="text" sx={{ fontSize: "14px", my: "8px" }} width="30%" />
            </td>
          </tr>
          <tr>
            <td>
              <Skeleton variant="text" sx={{ fontSize: "14px", my: "8px" }} width="30%" />
            </td>
          </tr>
          <tr>
            <td>
              <Skeleton variant="text" sx={{ fontSize: "14px", my: "8px" }} width="40%" />
            </td>
          </tr>
          <tr>
            <td>
              <Skeleton variant="text" sx={{ fontSize: "14px", my: "8px" }} width="30%" />
            </td>
          </tr>
          <tr>
            <td>
              <Skeleton variant="text" sx={{ fontSize: "14px", my: "8px" }} width="40%" />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <Grid container size={12} spacing={1} display="flex" flexDirection={{ xs: "column-reverse", md: "row" }}>
      <Grid size={{ xs: 12, md: "grow" }}>
        <DetailContainer>
          <Box position="relative" mb={-2}>
            <Title>
              {book ? t("product.detail") : <Skeleton variant="text" sx={{ fontSize: "inherit" }} width="40%" />}
            </Title>
            <MobileExtendButton disabled={loading || !book} onClick={() => setOpenDetail(true)}>
              {book ? (
                <>
                  {t("product.author")}, {t("publisher.label")},... <KeyboardArrowRight fontSize="small" />
                </>
              ) : (
                <Skeleton variant="text" sx={{ fontSize: "inherit" }} width="35%" />
              )}
            </MobileExtendButton>
          </Box>
          {tabletMode ? (
            <SwipeableDrawer
              anchor="bottom"
              open={openDetail}
              onOpen={() => setOpenDetail(true)}
              onClose={() => setOpenDetail(false)}
              disableSwipeToOpen={true}
            >
              <DrawerContainer>
                <Title>{t("product.detail")}</Title>
                <Box mt={-2} mb={2}>
                  {details}
                </Box>
              </DrawerContainer>
            </SwipeableDrawer>
          ) : (
            details
          )}
          <Title>
            {book ? t("product.description") : <Skeleton variant="text" sx={{ fontSize: "inherit" }} width="40%" />}
          </Title>
          <DescTitle>{book?.title}</DescTitle>
          <DescriptionContainer>
            <Description ref={descRef} className={minimize ? "minimize" : ""}>
              {book ? (
                book?.description
              ) : (
                <>
                  <Skeleton variant="text" sx={{ fontSize: "16px", mb: "15px" }} width="60%" />
                  <Skeleton variant="text" sx={{ fontSize: "inherit" }} width="100%" />
                  <Skeleton variant="text" sx={{ fontSize: "inherit" }} width="100%" />
                  <Skeleton variant="text" sx={{ fontSize: "inherit" }} width="100%" />
                  <Skeleton variant="text" sx={{ fontSize: "inherit" }} width="40%" />
                </>
              )}
            </Description>
            {overflowed && (
              <Showmore className={minimize ? "" : "expand"} onClick={toggleMinimize}>
                {minimize ? (
                  <>
                    {t("show.more")} <KeyboardArrowDown />
                  </>
                ) : (
                  <>
                    {t("show.less")} <KeyboardArrowUp />
                  </>
                )}
              </Showmore>
            )}
          </DescriptionContainer>
        </DetailContainer>
      </Grid>
      <Grid size={{ xs: 12, md: "auto" }} display={{ xs: "block", md: "flex" }}>
        <ProductsContainer>
          <Box padding={{ xs: "0 12px", md: "10px 20px 0" }}>
            <Title>
              {book ? t("product.other") : <Skeleton variant="text" sx={{ fontSize: "inherit" }} width={150} />}
            </Title>
          </Box>
          <ProductsScroll
            {...{
              loading: loadRelated,
              data: relatedBooks,
              isSuccess: doneRelated,
              isError: errorRelated,
              isUninitialized,
            }}
          />
        </ProductsContainer>
      </Grid>
    </Grid>
  );
};

export default ProductDetailContainer;
