package com.ring.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ring.listener.ImageEntityListener;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents an entity as {@link Image} for images.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(ImageEntityListener.class)
@Table(name = "image")
public class Image {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "primary_sequence",
            sequenceName = "primary_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "primary_sequence"
    )
    private Long id;

    @Column(unique = true, name = "name")
    private String name;

    @Column(unique = true)
    private String publicId;

    @Column(name = "url")
    private String url;

    @Column(name = "type")
    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "detail_id")
    @JsonIgnore
    private BookDetail detail;
}
