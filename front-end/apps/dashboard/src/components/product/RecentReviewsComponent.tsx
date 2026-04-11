"use client";

import { Box, Rating, Stack, Typography } from "@mui/material";
import { Star as ReviewsIcon, StarBorder as StarBorderIcon } from "@mui/icons-material";
import { dateFormatter, timeFormatter } from "@ring/shared";
import { useLocale, useTranslations } from "next-intl";
import { useGetReviewsQuery } from "@/features/reviews/reviewsApiSlice";
import type { ReviewDTO } from "@ring/shared/models/reviewDTO";
import Link from "next/link";
import Placeholder from "@/components/custom/Placeholder";

interface RecentReviewsComponentProps {
  id: string;
  enabled?: boolean;
}

export default function RecentReviewsComponent({ id, enabled = true }: RecentReviewsComponentProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { data, isLoading } = useGetReviewsQuery({ bookId: Number(id), page: 0, size: 5 }, { skip: !enabled || !id });

  const recentReviews: ReviewDTO[] = data?.ids?.map((rid: number) => data?.entities?.[rid])?.filter(Boolean) ?? [];

  return (
    <Box position="relative" width="100%" height="100%">
      {isLoading ? (
        <Placeholder />
      ) : recentReviews.length > 0 ? (
        <>
          <Stack spacing={1.5}>
            {recentReviews.map((review) => {
              const date = new Date(review?.date ?? Date.now());
              return (
                <Box key={review?.id}>
                  <Box display="flex" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <Rating
                        value={review?.rating ?? 0}
                        readOnly
                        size="small"
                        icon={<ReviewsIcon fontSize="inherit" />}
                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                        sx={{ mr: 1.5 }}
                      />
                      <Link href={`/users/${review?.userId}`}>{review?.username}</Link>
                    </Box>
                    <Typography variant="body2" color="text.secondary" align="right">
                      {`${dateFormatter(date, locale)} - ${timeFormatter(date, locale)}`}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {review?.content ?? "-"}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
          {recentReviews?.length < 5 && (
            <Typography variant="body2" color="warning" align="center">
              {t("product.recent.reviews.out")}
            </Typography>
          )}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center">
          {t("product.recent.reviews.empty")}
        </Typography>
      )}
    </Box>
  );
}
