package com.ring.repository;

import com.ring.dto.projection.books.IBook;
import com.ring.dto.projection.books.IBookDetail;
import com.ring.model.entity.BookDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface named {@link BookDetailRepository} for managing {@link BookDetail} entities.
 */
@Repository
public interface BookDetailRepository extends JpaRepository<BookDetail, Long>{

    /**
     * Retrieves detailed information about a book based on its ID or slug.
     *
     * @param id the ID of the book to retrieve details for; optional if slug is provided.
     * @param slug the slug identifier of the book to retrieve details for; optional if ID is provided.
     * @return an {@code Optional} containing the details of the book AS an {@code IBookDetail}
     *         projection, or an empty {@code Optional} if no book matches the specified criteria.
     */
    @Query("""
        SELECT DISTINCT b.id AS id, 
            b.slug AS slug,
            b.price AS price, 
            b.discount AS discount, 
            b.title AS title,
            b.description AS description, 
            b.type AS type, 
            b.author AS author,
            b.amount AS amount, 
            p.id AS pubId, 
            p.name AS pubName,
            c.id AS cateId, 
            c.name AS cateName, 
            c.slug AS cateSlug,
            pc.id AS parentId, 
            pc.name AS parentName, 
            pc.slug AS parentSlug,
            pc.ancestor_id AS ancestorId, 
            s.id AS shopId, 
            s.name AS shopName,
            d.size AS size, 
            d.pages AS pages, 
            d.bDate AS date,
            d.bLanguage AS language, 
            d.bWeight AS weight, 
            i AS image, 
            pv AS previews,
            coalesce(od.totalOrders, 0) AS totalOrders,
            coalesce(rv.rating, 0) AS rating, rv.totalRates AS totalRates,
            coalesce(rv.five, 0) AS rate5,
            coalesce(rv.four, 0) AS rate4,
            coalesce(rv.three, 0) AS rate3,
            coalesce(rv.two, 0) AS rate2,
            coalesce(rv.one, 0) AS rate1
        FROM Book b
        LEFT JOIN b.detail d
        LEFT JOIN b.image i
        LEFT JOIN d.previewImages pv
        JOIN b.shop s
        JOIN b.publisher p
        JOIN b.cate c
        LEFT JOIN (
            SELECT p.id AS id, 
                p.name AS name, 
                p.slug AS slug, 
                p.parent.id AS ancestor_id
            FROM Category p
        ) pc ON pc.id = c.parent.id
        LEFT JOIN (
            SELECT o.book.id AS book_id, 
                sum(o.quantity) AS totalOrders
            FROM OrderItem o 
            GROUP BY o.book.id
        ) od ON b.id = od.book_id
        LEFT JOIN (
            SELECT r.book.id AS book_id,
                AVG(r.rating) AS rating,
                COUNT(r.id) AS totalRates,
                SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS five,
                SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS four,
                SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS three,
                SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS two,
                SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS one
            FROM Review r 
            GROUP BY r.book.id
        ) rv ON b.id = rv.book_id
        WHERE CASE WHEN COALESCE(:id) IS NOT NULL THEN (b.id = :id) ELSE (b.slug = :slug) END
    """)
    Optional<IBookDetail> findBookDetail(Long id, String slug);

    /**
     * Retrieves a book's detailed information based on its unique identifier.
     *
     * @param id the unique identifier of the book to be retrieved
     * @return an {@link Optional} containing the book information represented by {@code IBook},
     *         or an empty {@link Optional} if no book matches the provided identifier
     */
    @Query("""
        SELECT DISTINCT b.id AS id, 
            b.slug AS slug, 
            b.price AS price,
            b.discount AS discount, 
            b.title AS title, 
            b.description AS description,
            b.type AS type, 
            b.author AS author, 
            b.amount AS amount,
            i.id AS image, 
            p.id AS pubId, 
            p.name AS pubName,
            c.id AS cateId, 
            c.name AS cateName, 
            s.id AS shopId,
            s.name AS shopName, 
            d.size AS size, 
            d.pages AS pages,
            d.bDate AS date, 
            d.bLanguage AS language, 
            d.bWeight AS weight,
            pv.previews AS previews
        FROM Book b
        LEFT JOIN b.detail d
        LEFT JOIN (
            SELECT pi.detail.id AS detail_id, 
            ARRAY_AGG(pi.id) OVER (ORDER BY pi.detail.id) AS previews
            FROM Image pi
        ) pv ON pv.detail_id = d.id
        LEFT JOIN b.image i
        JOIN b.shop s
        JOIN b.publisher p
        JOIN b.cate c
        WHERE b.id = :id
    """)
    Optional<IBook> findBook(Long id);
}
