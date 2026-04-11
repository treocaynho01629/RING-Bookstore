package com.ring.service;

import com.ring.dto.request.BookRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.books.BookDTO;
import com.ring.dto.response.books.BookDetailDTO;
import com.ring.dto.response.books.BookDisplayDTO;
import com.ring.dto.response.books.BookResponseDTO;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.model.entity.Account;
import com.ring.model.enums.BookType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for handling book-related operations.
 */
public interface BookService {

        /**
         * Retrieves books by their IDs.
         *
         * @param ids the list of book IDs to retrieve
         * @return a list of {@link BookDisplayDTO} objects
         */
        List<BookDisplayDTO> getBooksInIds(List<Long> ids);

        /**
         * Retrieves books with pagination and filtering options.
         *
         * @param pageNo    the page number for pagination
         * @param pageSize  the size of each page
         * @param sortBy    the field to sort by
         * @param sortDir   the sorting direction (asc/desc)
         * @param keyword   the search keyword to filter books
         * @param amount    the minimum amount filter
         * @param rating    the minimum rating filter
         * @param cateId    the category ID to filter by
         * @param pubIds    the list of publisher IDs to filter by
         * @param types     the list of book types to filter by
         * @param shopId    the shop ID to filter by
         * @param userId    the user ID to filter by
         * @param fromRange the minimum price range
         * @param toRange   the maximum price range
         * @param withDesc  whether to include descriptions
         * @return a paginated list of {@link BookDisplayDTO} objects
         */
        PagingResponse<BookDisplayDTO> getBooks(Integer pageNo,
                        Integer pageSize,
                        String sortBy,
                        String sortDir,
                        String keyword,
                        Integer amount,
                        Integer rating,
                        Integer cateId,
                        List<Integer> pubIds,
                        List<BookType> types,
                        Long shopId,
                        Long userId,
                        Double fromRange,
                        Double toRange,
                        Boolean withDesc);

        /**
         * Retrieves a book by its ID.
         *
         * @param id       the ID of the book to retrieve
         * @param currUser the currently authenticated user.
         * @return the {@link BookDTO} object
         */
        BookDTO getBook(Long id, Account currUser);

        /**
         * Retrieves a random selection of books.
         *
         * @param amount   the number of random books to retrieve
         * @param withDesc whether to include descriptions
         * @return a list of random {@link BookDisplayDTO} objects
         */
        List<BookDisplayDTO> getRandomBooks(Integer amount,
                        Boolean withDesc);

        /**
         * Retrieves detailed book information by ID.
         *
         * @param id the ID of the book
         * @return the {@link BookDetailDTO} object
         */
        BookDetailDTO getBookDetail(Long id);

        /**
         * Retrieves detailed book information by slug.
         *
         * @param slug the slug of the book
         * @return the {@link BookDetailDTO} object
         */
        BookDetailDTO getBookDetail(String slug);

        /**
         * Retrieves book suggestions based on a keyword.
         *
         * @param keyword the search keyword
         * @return a list of suggested book titles
         */
        List<String> getBooksSuggestion(String keyword);

        /**
         * Creates a new book.
         *
         * @param request   the book creation details
         * @param thumbnail the book thumbnail image
         * @param images    the book images
         * @param user      the authenticated user creating the book
         * @return the created {@link BookResponseDTO} object
         */
        BookResponseDTO addBook(BookRequest request,
                        MultipartFile thumbnail,
                        MultipartFile[] images,
                        Account user);

        /**
         * Updates an existing book by its ID.
         *
         * @param id        the ID of the book to update
         * @param request   the book update details
         * @param thumbnail the new book thumbnail image (optional)
         * @param images    the new book images (optional)
         * @param user      the authenticated user updating the book
         * @return the updated {@link BookResponseDTO} object
         */
        BookResponseDTO updateBook(Long id,
                        BookRequest request,
                        MultipartFile thumbnail,
                        MultipartFile[] images,
                        Account user);

        /**
         * Deletes a book by its ID.
         *
         * @param id   the ID of the book to delete
         * @param user the authenticated user deleting the book
         * @return the deleted {@link BookResponseDTO} object
         */
        BookResponseDTO deleteBook(Long id,
                        Account user);

        /**
         * Retrieves book analytics data.
         *
         * @param shopId the shop ID for analytics
         * @param userId the user ID for analytics
         * @return the {@link StatDTO} containing analytics data
         */
        StatDTO getAnalytics(Long shopId,
                        Long userId);

        /**
         * Deletes multiple books by their IDs.
         *
         * @param ids  the list of book IDs to delete
         * @param user the authenticated user deleting the books
         */
        void deleteBooks(List<Long> ids,
                        Account user);

        /**
         * Deletes books that are not in the provided list of IDs.
         *
         * @param keyword   the search keyword to filter books
         * @param amount    the minimum amount filter
         * @param rating    the minimum rating filter
         * @param cateId    the category ID to filter by
         * @param pubIds    the list of publisher IDs to filter by
         * @param types     the list of book types to filter by
         * @param shopId    the shop ID to filter by
         * @param userId    the user ID to filter by
         * @param fromRange the minimum price range
         * @param toRange   the maximum price range
         * @param ids       the list of book IDs to exclude from deletion
         * @param user      the authenticated user deleting the books
         */
        void deleteBooksInverse(String keyword,
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
                        Account user);

        /**
         * Deletes all books for a specific shop.
         *
         * @param shopId the shop ID whose books are to be deleted
         * @param user   the authenticated user deleting the books
         */
        void deleteAllBooks(Long shopId, Account user);
}
