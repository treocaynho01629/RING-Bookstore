package com.ring.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ring.model.enums.BookLanguage;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Represents an entity as {@link BookDetail} for book details.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookDetail {

    @Id
    @Column(nullable = false, updatable = false)
    @JsonIgnore
    private Long id;

    @Column(nullable = false)
    private Short bWeight;

    @Column(nullable = false)
    private Short bLength;

    @Column(nullable = false)
    private Short bWidth;

    @Column(nullable = false)
    private Short bHeight;

    @Column
    private Integer pages;

    @Column
    private LocalDate bDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private BookLanguage bLanguage;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    @JsonIgnore
    @EqualsAndHashCode.Exclude
    private Book book;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "detail", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Image> previewImages;

    public void addImage(Image image) {
        previewImages.add(image);
        image.setDetail(this);
    }

    public void removeImage(Image image) {
        previewImages.remove(image);
        image.setDetail(null);
    }

    public void removeAllImages() {
        previewImages.forEach(image -> image.setDetail(null));
        this.previewImages.clear();
    }
}
