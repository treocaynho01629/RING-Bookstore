package com.ring.repository;

import com.ring.dto.projection.images.IImage;
import com.ring.model.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    @Query("""
        SELECT i.publicId 
        FROM Image i
        WHERE i.id IN :imageIds
    """)
    List<String> findPublicIds(List<Long> imageIds);

    @Query("""
        SELECT i 
        FROM Image i
        WHERE i.id IN :imageIds
    """)
    List<Image> findImages(List<Long> imageIds);

    @Query("""
        SELECT i.publicId AS publicId, 
            i.url AS url
        FROM AccountProfile p
        JOIN p.image i
        WHERE p.id = :id
    """)
    Optional<IImage> findByProfile(Long id);

    @Query("""
        SELECT i 
        FROM Image i
        LEFT JOIN Book b ON b.image.id = i.id
        LEFT JOIN i.detail d
        WHERE (b.id = :bookId OR d.id = :bookId)
        AND i.id = :imageId
    """)
    Optional<Image> findBookImage(Long bookId, Long imageId);

    @Query("""
        SELECT i.id 
        FROM Image i
        LEFT JOIN Book b ON b.image.id = i.id
        LEFT JOIN i.detail d
        WHERE (b.id = :bookId OR d.book.id = :bookId)
        AND i.id IN :imageIds
    """)
    List<Long> findBookImageIds(Long bookId, List<Long> imageIds);

}
