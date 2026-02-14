package com.ring.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

/**
 * Represents an entity as {@link Review} for reviews.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Review extends Auditable {

        @Id
        @Column(nullable = false, updatable = false)
        @SequenceGenerator(name = "primary_sequence", sequenceName = "primary_sequence", allocationSize = 1, initialValue = 10000)
        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "primary_sequence")
        private Long id;

        @Column(length = 1000)
        @Nationalized
        private String rContent;

        @Column
        private Integer rating;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "book_id")
        @JsonIgnore
        private Book book;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        @JsonIgnore
        private Account user;

        // TODO: Add hidden/spoiler review process
        @JsonIgnore
        @Column(columnDefinition = "boolean default false")
        private boolean isHidden = false;
}
