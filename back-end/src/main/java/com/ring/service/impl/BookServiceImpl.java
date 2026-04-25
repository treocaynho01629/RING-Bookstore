package com.ring.service.impl;

import com.github.slugify.Slugify;
import com.ring.common.AppConstants;
import com.ring.common.CommonUtils;
import com.ring.dto.projection.books.IBook;
import com.ring.dto.projection.books.IBookDetail;
import com.ring.dto.projection.books.IBookDisplay;
import com.ring.dto.request.BookRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.books.BookDTO;
import com.ring.dto.response.books.BookDetailDTO;
import com.ring.dto.response.books.BookDisplayDTO;
import com.ring.dto.response.books.BookResponseDTO;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.BookMapper;
import com.ring.mapper.DashboardMapper;
import com.ring.model.entity.*;
import com.ring.model.enums.BookType;
import com.ring.repository.*;
import com.ring.service.BookService;
import com.ring.service.ImageService;
import com.ring.common.FileUploadUtil;
import lombok.RequiredArgsConstructor;

import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.JpaSort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing books.
 */
@RequiredArgsConstructor
@Service
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepo;
    private final BookDetailRepository detailRepo;
    private final PublisherRepository pubRepo;
    private final CategoryRepository cateRepo;
    private final ShopRepository shopRepo;
    private final ImageRepository imageRepo;

    private final ImageService imageService;
    private final MessageService messageService;

    private final BookMapper bookMapper;
    private final DashboardMapper dashMapper;
    private final Slugify slg = Slugify.builder().lowerCase(false).build();

    public List<BookDisplayDTO> getRandomBooks(Integer amount, Boolean withDesc) {
        List<IBookDisplay> booksList = bookRepo.findRandomBooks(amount, withDesc);
        return booksList.stream()
                .map(bookMapper::displayToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(AppConstants.BOOKS)
    public List<BookDisplayDTO> getBooksInIds(List<Long> ids) {
        List<IBookDisplay> booksList = bookRepo.findBooksDisplayInIds(ids);
        return booksList.stream()
                .map(bookMapper::displayToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(AppConstants.BOOKS)
    public PagingResponse<BookDisplayDTO> getBooks(Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir,
            String keyword,
            Integer rating,
            Integer amount,
            Integer cateId,
            List<Integer> pubIds,
            List<BookType> types,
            Long shopId,
            Long userId,
            Double fromRange,
            Double toRange,
            Boolean withDesc) {

        // Favorite sort
        Pageable pageable;
        if (sortBy.equals("favorite")) {
            sortBy = "((COALESCE(rating, 0) * 0.6) + ((COUNT(rv.rating) / 100.0) * 0.25) + ((COALESCE(totalOrders, 0) / 100.0) * 0.15))";
            pageable = PageRequest.of(pageNo, pageSize,
                    JpaSort.unsafe(sortDir.equals(AppConstants.ASCENDING) ? Sort.Direction.ASC
                            : Sort.Direction.DESC, sortBy));
        } else {
            // Normal sort by
            pageable = PageRequest.of(pageNo, pageSize,
                    Sort.by(sortDir.equals(AppConstants.ASCENDING) ? Sort.Direction.ASC
                            : Sort.Direction.DESC, sortBy));
        }

        // Fetch from the database
        Page<IBookDisplay> booksList = bookRepo.findBooksWithFilter(
                keyword,
                cateId,
                pubIds,
                types,
                shopId,
                userId,
                fromRange,
                toRange,
                withDesc,
                rating,
                amount,
                pageable);
        List<BookDisplayDTO> bookDTOS = booksList.map(bookMapper::displayToDTO).toList();
        return new PagingResponse<>(
                bookDTOS,
                booksList.getTotalPages(),
                booksList.getTotalElements(),
                booksList.getSize(),
                booksList.getNumber(),
                booksList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.BOOK, key = "#id")
    public BookDTO getBook(Long id, Account currUser) {
        boolean isAdmin = CommonUtils.isAuthAdmin();
        IBook book = detailRepo.findBook(id, isAdmin ? null : currUser.getId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.product") });
                    return new ResourceNotFoundException(errorMsg);
                });
        return bookMapper.projectionToDTO(book, imageRepo.findPreviewByBookId(book.getId())); // Map to DTO
    }

    @Cacheable(cacheNames = AppConstants.BOOK_DETAIL, key = "#id")
    public BookDetailDTO getBookDetail(Long id) {
        IBookDetail book = detailRepo.findBookDetail(id, null)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.product") });
                    return new ResourceNotFoundException(errorMsg);
                });
        return bookMapper.detailToDTO(book, imageRepo.findPreviewByBookId(book.getId())); // Map to DTO
    }

    @Cacheable(cacheNames = AppConstants.BOOK_DETAIL, key = "#slug")
    public BookDetailDTO getBookDetail(String slug) {
        IBookDetail book = detailRepo.findBookDetail(null, slug)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.product") });
                    return new ResourceNotFoundException(errorMsg);
                });
        return bookMapper.detailToDTO(book, imageRepo.findPreviewByBookId(book.getId())); // Map to DTO
    }

    @Cacheable(cacheNames = AppConstants.BOOK_SUGGESTIONS, key = "#keyword")
    public List<String> getBooksSuggestion(String keyword) {
        return bookRepo.findSuggestion(keyword);
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = { AppConstants.BOOKS,
                    AppConstants.BOOK_SUGGESTIONS,
                    AppConstants.BOOK_ANALYTICS }, allEntries = true),
            @CacheEvict(cacheNames = { AppConstants.BOOK,
                    AppConstants.BOOK_DETAIL }, key = "#result.id"),
            @CacheEvict(cacheNames = AppConstants.BOOK_DETAIL, key = "#result.slug", condition = "#result != null") })
    @Transactional
    public BookResponseDTO addBook(BookRequest request,
            MultipartFile thumbnail,
            MultipartFile[] images,
            Account user) {
        // Validation
        Category cate = cateRepo.findById(request.getCateId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.cate") });
                    return new ResourceNotFoundException(errorMsg);
                });
        Publisher pub = pubRepo.findById(request.getPubId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.pub") });
                    return new ResourceNotFoundException(errorMsg);
                });
        Shop shop = shopRepo.findById(request.getShopId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.shop") });
                    return new ResourceNotFoundException(errorMsg);
                });
        if (!CommonUtils.isValidShopOwner(shop, user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.shop") });
            throw new EntityOwnershipException(errorMsg);
        }

        // Thumbnail
        Image savedThumbnail = imageService.upload(thumbnail, FileUploadUtil.PRODUCT_FOLDER);

        // Slugify
        String slug = slg.slugify(request.getTitle());

        // Create a new book
        var book = Book.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .image(savedThumbnail)
                .price(request.getPrice())
                .discount(request.getDiscount())
                .publisher(pub)
                .cate(cate)
                .shop(shop)
                .author(request.getAuthor())
                .amount(request.getAmount())
                .type(request.getType())
                .slug(slug)
                .build();
        Book addedBook = bookRepo.save(book); // Save to the database

        // Images upload
        ArrayList<Image> previewImages = new ArrayList<>();
        if (images != null && images.length != 0) {
            previewImages.addAll(imageService.uploadMultiple(Arrays.asList(images),
                    FileUploadUtil.PRODUCT_FOLDER));
        }

        // Create book details
        var bookDetail = BookDetail.builder()
                .book(addedBook)
                .bWeight(request.getWeight())
                .bLength(request.getLength())
                .bWidth(request.getWidth())
                .bHeight(request.getHeight())
                .pages(request.getPages())
                .bLanguage(request.getLanguage())
                .bDate(request.getDate())
                .previewImages(previewImages)
                .build();
        BookDetail addedDetail = detailRepo.save(bookDetail); // Save details to the database

        // Return added book
        addedBook.setDetail(addedDetail);
        return bookMapper.bookToResponseDTO(addedBook);
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = { AppConstants.BOOKS,
                    AppConstants.BOOK_SUGGESTIONS }, allEntries = true),
            @CacheEvict(cacheNames = { AppConstants.BOOK, AppConstants.BOOK_DETAIL }, key = "#id"),
            @CacheEvict(cacheNames = AppConstants.BOOK_DETAIL, key = "#result.slug", condition = "#result != null") })
    @Transactional
    public BookResponseDTO updateBook(Long id,
            BookRequest request,
            MultipartFile thumbnail,
            MultipartFile[] images,
            Account user) {

        // Check book exists & category, publisher validation
        Book book = bookRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.product") });
                    return new ResourceNotFoundException(errorMsg);
                });
        Category cate = cateRepo.findById(request.getCateId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.cate") });
                    return new ResourceNotFoundException(errorMsg);
                });
        Publisher pub = pubRepo.findById(request.getPubId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.pub") });
                    return new ResourceNotFoundException(errorMsg);
                });
        BookDetail currDetail = book.getDetail();
        List<String> removePublicIds = request.getRemovePublicIds();
        boolean isRemove = removePublicIds != null && !removePublicIds.isEmpty();

        // Check if correct ownership
        if (!CommonUtils.isValidShopOwner(book.getShop(), user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.product") });
            throw new EntityOwnershipException(errorMsg);
        }

        // Image upload/replace
        // Contain new image >> upload/replace
        if (thumbnail != null) {

            Image oldImage = book.getImage();
            Image savedImage = imageService.upload(thumbnail,
                    FileUploadUtil.PRODUCT_FOLDER); // Upload new image
            book.setImage(savedImage); // Set new thumbnail
            currDetail.removeImage(oldImage); // Remove old thumbnail from preview images
        } else if (request.getThumbnailPublicId() != null
                && !request.getThumbnailPublicId().equals(book.getImage().getPublicId())) {

            Image oldImage = book.getImage();
            Image newImage = imageRepo.findBookImage(id, request.getThumbnailPublicId())
                    .orElseThrow(() -> {
                        var errorMsg = messageService.getMessage("exception.not.found",
                                new Object[] { new DefaultMessageSourceResolvable(
                                        "label.image") });
                        return new ResourceNotFoundException(errorMsg);
                    });

            book.setImage(newImage); // Set new image
            newImage.setDetail(null); // Remove new image from preview images
            currDetail.addImage(oldImage); // Add old image to preview images
        }

        // Set new details info
        currDetail.setBWeight(request.getWeight());
        currDetail.setBLength(request.getLength());
        currDetail.setBWidth(request.getWidth());
        currDetail.setBHeight(request.getHeight());
        currDetail.setPages(request.getPages());
        currDetail.setBLanguage(request.getLanguage());
        currDetail.setBDate(request.getDate());

        // Images
        if (images != null && images.length != 0) {
            imageService.uploadMultiple(Arrays.asList(images), FileUploadUtil.PRODUCT_FOLDER)
                    .forEach(currDetail::addImage);
        }
        detailRepo.save(currDetail); // Save new details to the database

        // Set new info
        String slug = slg.slugify(request.getTitle());

        book.setSlug(slug);
        book.setTitle(request.getTitle());
        book.setDescription(request.getDescription());
        book.setPrice(request.getPrice());
        book.setDiscount(request.getDiscount());
        book.setPublisher(pub);
        book.setCate(cate);
        book.setAuthor(request.getAuthor());
        book.setAmount(request.getAmount());
        book.setType(request.getType());

        // Update
        Book updatedBook = bookRepo.save(book);

        // Delete images
        if (isRemove)
            imageService.deleteImages(imageRepo.findBookImageIds(id, removePublicIds));

        return bookMapper.bookToResponseDTO(updatedBook);
    }

    @Cacheable(AppConstants.BOOK_ANALYTICS)
    public StatDTO getAnalytics(Long shopId, Long userId) {

        var label = StringUtils.capitalize(messageService.getMessage("label.product"));
        return dashMapper.statToDTO(bookRepo.getBookAnalytics(shopId, userId),
                AppConstants.BOOKS,
                label);
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = { AppConstants.BOOKS,
                    AppConstants.BOOK_SUGGESTIONS,
                    AppConstants.BOOK_ANALYTICS }, allEntries = true),
            @CacheEvict(cacheNames = { AppConstants.BOOK,
                    AppConstants.BOOK_DETAIL }, key = "#id"),
            @CacheEvict(cacheNames = AppConstants.BOOK_DETAIL, key = "#result.slug", condition = "#result != null") })
    @Transactional
    public BookResponseDTO deleteBook(Long id, Account user) {
        Book book = bookRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.product") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if correct ownership
        if (!CommonUtils.isValidShopOwner(book.getShop(), user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.product") });
            throw new EntityOwnershipException(errorMsg);
        }

        bookRepo.deleteById(id); // Delete from database
        return bookMapper.bookToResponseDTO(book);
    }

    @CacheEvict(cacheNames = { AppConstants.BOOK,
            AppConstants.BOOK_DETAIL,
            AppConstants.BOOKS,
            AppConstants.BOOK_SUGGESTIONS,
            AppConstants.BOOK_ANALYTICS }, allEntries = true)
    @Transactional
    public void deleteBooks(List<Long> ids, Account user) {
        List<Long> deleteIds = CommonUtils.isAuthAdmin() ? ids
                : bookRepo.findBookIdsByInIdsAndOwner(ids, user.getId());
        bookRepo.deleteAllById(deleteIds);
    }

    @CacheEvict(cacheNames = { AppConstants.BOOK,
            AppConstants.BOOK_DETAIL,
            AppConstants.BOOKS,
            AppConstants.BOOK_SUGGESTIONS,
            AppConstants.BOOK_ANALYTICS }, allEntries = true)
    @Transactional
    public void deleteBooksInverse(String keyword,
            Integer amount,
            Integer rating,
            Integer cateId,
            List<Integer> pubIds,
            List<BookType> types,
            Long shopId,
            Long userId,
            Double fromRange,
            Double toRange,
            List<Long> ids,
            Account user) {
        List<Long> deleteIds = bookRepo.findInverseIds(keyword,
                cateId,
                pubIds,
                types,
                shopId,
                CommonUtils.isAuthAdmin() ? userId : user.getId(),
                fromRange,
                toRange,
                rating,
                amount,
                ids);
        bookRepo.deleteAllById(deleteIds);
    }

    @CacheEvict(cacheNames = { AppConstants.BOOK,
            AppConstants.BOOK_DETAIL,
            AppConstants.BOOKS,
            AppConstants.BOOK_SUGGESTIONS,
            AppConstants.BOOK_ANALYTICS }, allEntries = true)
    @Transactional
    public void deleteAllBooks(Long shopId, Account user) {

        if (CommonUtils.isAuthAdmin()) {
            if (shopId != null) {
                bookRepo.deleteAllByShopId(shopId);
            } else {
                bookRepo.deleteAll();
            }
        } else {
            if (shopId != null) {
                bookRepo.deleteAllByShopIdAndShop_Owner(shopId, user);
            } else {
                bookRepo.deleteAllByShop_Owner(user);
            }
        }
    }
}
