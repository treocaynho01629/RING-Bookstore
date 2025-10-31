package com.ring.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ring.model.enums.AddressType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

/**
 * Represents an entity as {@link Address} for addresses.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class Address {

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

	@Column(length = 250)
	@Nationalized
	private String name;

	@Column(length = 250)
	@Nationalized
	private String companyName;

	@Column(length = 15)
	private String phone;

	@Column(length = 200)
	@Nationalized
	private String city;

	@Column(length = 300)
	@Nationalized
	private String address;

	@Enumerated(EnumType.STRING)
	@Column(length = 30)
	private AddressType type;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "profile_id")
	@JsonIgnore
	private AccountProfile profile;
}
