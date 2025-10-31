package com.ring.repository;

import com.ring.model.entity.PaymentInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface named {@link PaymentInfoRepository} for managing {@link PaymentInfo} entities.
 */
@Repository
public interface PaymentInfoRepository extends JpaRepository<PaymentInfo, Integer> {

    @Query("""
        SELECT p 
        FROM OrderReceipt o
        JOIN o.payment p
        WHERE o.id = :id
    """)
    Optional<PaymentInfo> findByOrder(Long id);
}
