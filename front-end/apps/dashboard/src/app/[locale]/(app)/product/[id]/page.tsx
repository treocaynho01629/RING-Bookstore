"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { styled } from "@mui/material/styles";
import { Box, Button, Card, Divider, Stack, Typography, Chip } from "@mui/material";
import { Edit, ArrowBack } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { currencyFormat, idFormatter } from "@ring/shared";
import { getImageSrc } from "@ring/shared/enums/image";
import CustomBreadcrumbs from "@/components/custom/CustomBreadcrumbs";
import Link from "next/link";

import type { BookDetailDTO } from "@ring/shared/models/bookDetailDTO";

//#region styled
const SectionCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing(2)};
`;

const SectionTitle = styled(Typography)`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const InfoRow = styled(Box)`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing(1.5)} 0;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const InfoLabel = styled(Typography)`
  font-weight: 500;
  min-width: 150px;
  font-size: 14px;
`;

const InfoValue = styled(Typography)`
  flex: 1;
  font-size: 14px;
`;

const ImageContainer = styled(Box)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
`;

const ProductImage = styled(Box)`
  width: 200px;
  height: 280px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.palette.background.paper};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DescriptionBox = styled(Box)`
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.palette.background.default};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  min-height: 100px;
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
`;
//#endregion

// Template data matching BookDetailDTO structure
const templateProduct: BookDetailDTO = {
  id: 1,
  slug: "example-product",
  srcSet: {
    "30": "/api/images/30/example.jpg",
    "100": "/api/images/100/example.jpg",
    "200": "/api/images/200/example.jpg",
  },
  previewsSrcSet: [
    {
      "30": "/api/images/30/preview1.jpg",
      "100": "/api/images/100/preview1.jpg",
    },
    {
      "30": "/api/images/30/preview2.jpg",
      "100": "/api/images/100/preview2.jpg",
    },
  ],
  price: 250000,
  discount: 0.15,
  title: "Example Product Title",
  description:
    "This is a detailed description of the product. It contains information about the product features, specifications, and other relevant details that customers might want to know before making a purchase decision.",
  type: "SOFT_COVER",
  author: "Author Name",
  amount: 50,
  shopId: 1,
  shopName: "Example Shop",
  publisher: {
    id: 1,
    name: "Example Publisher",
    image: "/api/images/publisher.jpg",
  },
  category: {
    id: 1,
    slug: "example-category",
    name: "Example Category",
    parentId: undefined,
  },
  size: "20 x 15 x 3 cm",
  pages: 300,
  date: "2024-01-15",
  language: "VN",
  weight: 0.5,
  totalOrders: 125,
  reviewsInfo: {
    rating: 4.5,
    total: 45,
  },
};

export default function DetailProductPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations();
  const [isEditing, setIsEditing] = useState(false);

  // Using template data for now
  const product = templateProduct;

  const handleEdit = () => {
    setIsEditing(true);
    // TODO: Implement edit functionality
  };

  const breadcrumbItems = [
    { label: t("product.management"), href: "/product" },
    { label: product.title || t("product.detail"), href: "#" },
  ];

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {t("product.detail")}
          </Typography>
          <CustomBreadcrumbs items={breadcrumbItems} />
        </Box>
        <Stack direction="row" spacing={2}>
          <Button component={Link} href="/product" startIcon={<ArrowBack />} variant="outlined" color="warning">
            {t("back")}
          </Button>
          <Button startIcon={<Edit />} variant="outlined" color="info" onClick={handleEdit}>
            {t("update")}
          </Button>
        </Stack>
      </Box>

      {/* Content */}
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
        <Box flex={2}>
          <Stack spacing={3}>
            <SectionCard>
              <SectionTitle>{t("product.basic")}</SectionTitle>
              <Divider sx={{ mb: 2 }} />
              <InfoRow>
                <InfoLabel>{t("product.id")}:</InfoLabel>
                <InfoValue>{idFormatter(Number(product.id))}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("product.title")}:</InfoLabel>
                <InfoValue>{product.title}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("product.author")}:</InfoLabel>
                <InfoValue>{product.author || "-"}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("product.type.label")}:</InfoLabel>
                <InfoValue>
                  <Chip label={product.type || "-"} size="small" />
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("category.label")}:</InfoLabel>
                <InfoValue>{product.category?.name || "-"}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("publisher.label")}:</InfoLabel>
                <InfoValue>{product.publisher?.name || "-"}</InfoValue>
              </InfoRow>
            </SectionCard>

            {/* Pricing & Inventory */}
            <SectionCard>
              <SectionTitle>{t("product.inventory")}</SectionTitle>
              <Divider sx={{ mb: 2 }} />
              <InfoRow>
                <InfoLabel>{t("product.price")}:</InfoLabel>
                <InfoValue>{currencyFormat.format(product.price || 0)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("product.discount")}:</InfoLabel>
                <InfoValue>
                  {product.discount ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>{currencyFormat.format(-(product.price || 0) * (product.discount || 0))}</Typography>
                      <Chip label={`-${((product.discount || 0) * 100).toFixed(0)}%`} color="error" size="small" />
                    </Box>
                  ) : (
                    "-"
                  )}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("quantity.label") || "Stock"}:</InfoLabel>
                <InfoValue>
                  <Chip
                    label={product.amount || 0}
                    color={product.amount && product.amount > 0 ? "success" : "error"}
                    size="small"
                  />
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("product.orders")}:</InfoLabel>
                <InfoValue>{product.totalOrders || 0}</InfoValue>
              </InfoRow>
            </SectionCard>
            <SectionCard>
              <SectionTitle>{t("product.info")}</SectionTitle>
              <Divider sx={{ mb: 2 }} />
              <InfoRow>
                <InfoLabel>{t("product.size")}:</InfoLabel>
                <InfoValue>{product.size || "-"}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("product.pages")}:</InfoLabel>
                <InfoValue>{product.pages || "-"}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("product.weight")}:</InfoLabel>
                <InfoValue>{product.weight ? `${product.weight} kg` : "-"}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("product.language")}:</InfoLabel>
                <InfoValue>
                  <Chip label={product.language || "-"} size="small" />
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("product.date")}:</InfoLabel>
                <InfoValue>{product.date || "-"}</InfoValue>
              </InfoRow>
            </SectionCard>

            {/* Description */}
            <SectionCard>
              <SectionTitle>{t("product.description")}</SectionTitle>
              <Divider sx={{ mb: 2 }} />
              <DescriptionBox>{product.description || "-"}</DescriptionBox>
            </SectionCard>
          </Stack>
        </Box>

        {/* Right Column - Images & Shop */}
        <Box flex={1}>
          <Stack spacing={3}>
            {/* Product Images */}
            <SectionCard>
              <SectionTitle>{t("product.images") || "Product Images"}</SectionTitle>
              <Divider sx={{ mb: 2 }} />
              <ImageContainer>
                {product.srcSet && (
                  <ProductImage>
                    <LazyLoadImage
                      src={getImageSrc(product.srcSet, 200)}
                      alt={product.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      placeholder={
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "action.hover",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {t("product.noImage") || "No Image"}
                          </Typography>
                        </Box>
                      }
                    />
                  </ProductImage>
                )}
                {product.previewsSrcSet?.map((preview, index) => (
                  <ProductImage key={index}>
                    <LazyLoadImage
                      src={getImageSrc(preview, 200)}
                      alt={`${product.title} preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </ProductImage>
                ))}
              </ImageContainer>
            </SectionCard>

            {/* Shop Information */}
            <SectionCard>
              <SectionTitle>{t("product.shopInfo") || "Shop Information"}</SectionTitle>
              <Divider sx={{ mb: 2 }} />
              <InfoRow>
                <InfoLabel>{t("product.shop")}:</InfoLabel>
                <InfoValue>{product.shopName || "-"}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>{t("product.shopId") || "Shop ID"}:</InfoLabel>
                <InfoValue>{product.shopId ? idFormatter(Number(product.shopId)) : "-"}</InfoValue>
              </InfoRow>
            </SectionCard>

            {/* Reviews Summary */}
            {product.reviewsInfo && (
              <SectionCard>
                <SectionTitle>{t("review.label") || "Reviews Summary"}</SectionTitle>
                <Divider sx={{ mb: 2 }} />
                <InfoRow>
                  <InfoLabel>{t("review.rating") || "Rating"}:</InfoLabel>
                  <InfoValue>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{product.reviewsInfo.rating?.toFixed(1)}</Typography>
                      <Chip label={`${product.reviewsInfo.total || 0} reviews`} size="small" />
                    </Box>
                  </InfoValue>
                </InfoRow>
              </SectionCard>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
