import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import { dateFormatter, timeFormatter } from "@ring/shared/utils/convert";
import { Link } from "react-router";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import Skeleton from "@mui/material/Skeleton";
import AccessTime from "@mui/icons-material/AccessTime";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import ReportGmailerrorred from "@mui/icons-material/ReportGmailerrorred";
import EditOutlined from "@mui/icons-material/EditOutlined";

//#region styled
const ReviewContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const Profile = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 0.5px solid transparent;
  padding: 15px 0 5px;

  &.active {
    border-color: ${({ theme }) => theme.vars.palette.primary.main};
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 10px 0 5px;
  }
`;

const RateContent = styled.div`
  margin: ${({ theme }) => theme.spacing(1)} 0 ${({ theme }) => theme.spacing(2)};
  font-size: 15px;
  overflow: hidden;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin: ${({ theme }) => theme.spacing(0.5)} 0 ${({ theme }) => theme.spacing(2)};
  }
`;

const ActionButton = styled.span`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  opacity: 0.9;
  font-size: 14px;
  cursor: pointer;

  &.mobile {
    display: none;
  }

  svg {
    color: ${({ theme }) => theme.vars.palette.text.secondary};
    font-size: 20px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${({ theme }) => theme.vars.palette.warning.main};

      svg {
        color: ${({ theme }) => theme.vars.palette.warning.main};
      }
    }
  }

  ${({ theme }) => theme.breakpoints.down("sm")} {
    display: none;
    &.mobile {
      display: flex;
    }
  }
`;

const RatingInfo = styled.p`
  font-size: 14px;
  padding: 0;
  margin: 0;
  margin-right: ${({ theme }) => theme.spacing(1)};
  font-weight: 400;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    max-width: 95px;
    &.time {
      display: none;
    }
  }

  &:last-child {
    margin-right: 0;
  }
`;

const InfoContainer = styled.div`
  display: flex;
`;

const TimeContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
`;

const ProductContent = styled.div`
  font-size: 14px;
  padding: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.vars.palette.text.secondary};
  border: 0.5px dashed ${({ theme }) => theme.vars.palette.warning.main};
`;
//#endregion

const ReviewItem = ({ review, username, isPreview, handleClick }) => {
  const { t, i18n } = useTranslation();
  const date = new Date(review?.date);

  return (
    <ReviewContainer>
      <Profile className={username && username === review?.username ? "active" : ""}>
        <InfoContainer>
          {review ? (
            <>
              <Avatar
                sx={{
                  width: { xs: 30, md: 40 },
                  height: { xs: 30, md: 40 },
                  marginRight: 1,
                }}
                src={review?.userImage ?? null}
              />
              <div>
                <RatingInfo>{review?.username}</RatingInfo>
                <Rating
                  name="product-rating"
                  value={review?.rating ?? 0}
                  readOnly
                  getLabelText={(value) => `${value} Star${value !== 1 ? "s" : ""}`}
                  sx={{ fontSize: 16 }}
                  icon={<Star sx={{ fontSize: 16 }} />}
                  empty={<StarBorder sx={{ fontSize: 16 }} />}
                />
              </div>
            </>
          ) : (
            <>
              <Skeleton
                variant="circular"
                sx={{
                  width: { xs: 30, md: 40 },
                  height: { xs: 30, md: 40 },
                  marginRight: 1,
                }}
              />
              <div>
                <Skeleton variant="text" sx={{ fontSize: "14px" }} width={150} />
                <Skeleton variant="text" sx={{ fontSize: "14px" }} width={80} />
              </div>
            </>
          )}
        </InfoContainer>
        <TimeContainer>
          {review ? (
            <>
              <RatingInfo className="time">
                <AccessTime
                  sx={{
                    fontSize: 18,
                    marginRight: "5px",
                    color: "primary.main",
                  }}
                />
                {timeFormatter(date, i18n.language)}
              </RatingInfo>
              <RatingInfo>
                <CalendarMonth
                  sx={{
                    fontSize: 18,
                    marginRight: "5px",
                    color: "primary.main",
                  }}
                />
                {dateFormatter(date, i18n.language)}
              </RatingInfo>
              {(username && username === review?.username) || isPreview ? (
                <ActionButton className="mobile" onClick={handleClick}>
                  <EditOutlined />
                </ActionButton>
              ) : (
                <ActionButton className="mobile">
                  <ReportGmailerrorred />
                </ActionButton>
              )}
            </>
          ) : (
            <>
              <Skeleton
                variant="text"
                sx={{
                  fontSize: "14px",
                  marginRight: "10px",
                  display: { xs: "none", sm: "block" },
                }}
                width={50}
              />
              <Skeleton variant="text" sx={{ fontSize: "14px" }} width={100} />
              <Skeleton
                variant="circular"
                sx={{
                  display: {
                    xs: "block",
                    sm: "none",
                    height: 20,
                    width: 20,
                    marginLeft: "5px",
                  },
                }}
              />
            </>
          )}
        </TimeContainer>
      </Profile>
      <RateContent>
        {review ? (
          review?.content
        ) : (
          <>
            <Skeleton variant="text" sx={{ fontSize: "15px" }} width="100%" />
            <Skeleton variant="text" sx={{ fontSize: "15px" }} width="40%" />
          </>
        )}
      </RateContent>
      {isPreview && (
        <Link to={`/product/${review?.bookSlug}`} title={t("product.view")}>
          <ProductContent>{review?.bookTitle}</ProductContent>
        </Link>
      )}
      {review ? (
        (username && username === review?.username) || isPreview ? (
          <ActionButton onClick={handleClick}>
            <EditOutlined />
            &nbsp;{t("update")}
          </ActionButton>
        ) : (
          <ActionButton>
            <ReportGmailerrorred />
            &nbsp;{t("report")}
          </ActionButton>
        )
      ) : (
        <Skeleton variant="text" sx={{ fontSize: "14px" }} width={80} />
      )}
    </ReviewContainer>
  );
};

export default ReviewItem;
