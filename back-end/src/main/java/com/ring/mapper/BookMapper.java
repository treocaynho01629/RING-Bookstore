package com.ring.mapper;

import com.ring.dto.projection.books.IBook;
import com.ring.dto.projection.books.IBookDetail;
import com.ring.dto.projection.books.IBookDisplay;
import com.ring.dto.projection.images.IImage;
import com.ring.dto.response.books.BookDTO;
import com.ring.dto.response.books.BookDetailDTO;
import com.ring.dto.response.books.BookDisplayDTO;
import com.ring.dto.response.books.BookResponseDTO;
import com.ring.dto.response.categories.CategoryDTO;
import com.ring.dto.response.publishers.PublisherDTO;
import com.ring.dto.response.reviews.ReviewsInfoDTO;
import com.ring.model.entity.Book;
import com.ring.model.entity.Image;
import com.ring.common.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * A mapper for Book related DTOs.
 */
@RequiredArgsConstructor
@Service
public class BookMapper {
        private final FileUploadUtil fileUploadUtil;

        /**
         * Maps a {@link IBookDisplay} to a {@link BookDisplayDTO}.
         * 
         * @param book the book to map
         * @return the mapped {@link BookDisplayDTO}
         */
        public BookDisplayDTO displayToDTO(IBookDisplay book) {

                IImage image = book.getImage();

                // Generate image URL
                Map<Integer, String> srcSet = fileUploadUtil.generateSrcSet(image.getPublicId(),
                                FileUploadUtil.PRODUCT_SIZES);
                srcSet.put(600, image.getUrl());

                return new BookDisplayDTO(book.getId(),
                                book.getSlug(),
                                book.getTitle(),
                                srcSet,
                                book.getDescription(),
                                book.getPrice(),
                                book.getDiscount(),
                                book.getAmount(),
                                book.getShopId(),
                                book.getShopName(),
                                book.getRating(),
                                book.getTotalOrders());
        }

        /**
         * Maps a {@link IBookDetail} to a {@link BookDetailDTO}.
         * 
         * @param book the book to map
         * @return the mapped {@link BookDetailDTO}
         */
        public BookDetailDTO detailToDTO(IBookDetail book) {

                // Info
                Integer totalOrders = book.getTotalOrders();
                Double rating = book.getRating();
                Integer totalRates = book.getTotalRates();
                List<Integer> rates = new ArrayList<>();

                rates.add(book.getRate1());
                rates.add(book.getRate2());
                rates.add(book.getRate3());
                rates.add(book.getRate4());
                rates.add(book.getRate5());

                // Other preview images
                List<IImage> previews = book.getPreviews();
                List<Map<Integer, String>> previewsSrcSet = previews != null ? previews
                                .stream()
                                .map(image -> {
                                        // Generate image srcSet
                                        Map<Integer, String> srcSet = fileUploadUtil.generateSrcSet(image.getPublicId(),
                                                        FileUploadUtil.PRODUCT_SIZES);
                                        srcSet.put(600, image.getUrl());
                                        return srcSet;
                                })
                                .collect(Collectors.toList())
                                : null;

                // Category
                CategoryDTO cate = new CategoryDTO(
                                book.getCateId(),
                                book.getCateSlug(),
                                book.getCateName(),
                                book.getParentId(),
                                book.getParentId() != null
                                                ? new CategoryDTO(book.getParentId(),
                                                                book.getParentSlug(),
                                                                book.getParentName(),
                                                                book.getAncestorId())
                                                : null);

                // Publisher
                PublisherDTO pub = new PublisherDTO(
                                book.getPubId(),
                                book.getPubName());

                // Generate image URL
                IImage image = book.getImage();
                Map<Integer, String> srcSet = fileUploadUtil.generateSrcSet(image.getPublicId(),
                                FileUploadUtil.PRODUCT_SIZES);
                srcSet.put(600, image.getUrl());

                return new BookDetailDTO(book.getId(),
                                book.getSlug(),
                                srcSet,
                                previewsSrcSet,
                                book.getPrice(),
                                book.getDiscount(),
                                book.getTitle(),
                                book.getDescription(),
                                book.getType(),
                                book.getAuthor(),
                                book.getAmount(),
                                book.getShopId(),
                                book.getShopName(),
                                pub,
                                cate,
                                book.getSize(),
                                book.getPages(),
                                book.getDate(),
                                book.getLanguage(),
                                book.getWeight(),
                                totalOrders,
                                new ReviewsInfoDTO(rating, totalRates, rates));
        }

        /**
         * Maps a {@link Book} to a {@link BookResponseDTO}.
         * 
         * @param book the book to map
         * @return the mapped {@link BookResponseDTO}
         */
        public BookResponseDTO bookToResponseDTO(Book book) {

                return new BookResponseDTO(book.getId(),
                                book.getSlug(),
                                book.getPrice(),
                                book.getDiscount(),
                                book.getTitle());
        }

        /**
         * Maps a {@link IBook} to a {@link BookDTO}.
         * 
         * @param book       the book to map
         * @param imagesList the list of images to map
         * @return the mapped {@link BookDTO}
         */
        public BookDTO projectionToDTO(IBook book, List<Image> imagesList) {

                // Images
                Optional<Image> thumbnail = imagesList.stream()
                                .filter(item -> item.getId().equals(book.getImage()))
                                .findFirst();
                List<Image> previews = imagesList.stream()
                                .filter(item -> !item.getId().equals(book.getImage()))
                                .toList();

                // Category
                CategoryDTO cate = new CategoryDTO(
                                book.getCateId(),
                                book.getCateName());

                // Publisher
                PublisherDTO pub = new PublisherDTO(
                                book.getPubId(),
                                book.getPubName());

                return new BookDTO(book.getId(),
                                book.getSlug(),
                                thumbnail.get(),
                                previews,
                                book.getPrice(),
                                book.getDiscount(),
                                book.getTitle(),
                                book.getDescription(),
                                book.getType(),
                                book.getAuthor(),
                                book.getSize(),
                                book.getPages(),
                                book.getDate(),
                                book.getLanguage(),
                                book.getWeight(),
                                book.getAmount(),
                                pub,
                                cate,
                                book.getShopId(),
                                book.getShopName());
        }
}
