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
        select i.publicId from Image i
        where i.id in :imageIds
    """)
    List<String> findPublicIds(List<Long> imageIds);

    @Query("""
        select i from Image i
        where i.id in :imageIds
    """)
    List<Image> findImages(List<Long> imageIds);

    @Query("""
        select i.publicId as publicId, i.url as url
        from AccountProfile p
        join p.image i
        where p.id = :id
    """)
    Optional<IImage> findByProfile(Long id);

    @Query("""
        select i from Image i
        left join Book b on b.image.id = i.id
        left join i.detail d
        where (b.id = :bookId or d.id = :bookId)
        and i.id = :imageId
    """)
    Optional<Image> findBookImage(Long bookId, Long imageId);

    @Query("""
        select i.id from Image i
        left join Book b on b.image.id = i.id
        left join i.detail d
        where (b.id = :bookId or d.book.id = :bookId)
        and i.id in :imageIds
    """)
    List<Long> findBookImageIds(Long bookId, List<Long> imageIds);

}
