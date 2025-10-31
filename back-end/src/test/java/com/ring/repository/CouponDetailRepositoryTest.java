package com.ring.repository;

import com.ring.base.AbstractRepositoryTest;
import com.ring.model.entity.Coupon;
import com.ring.model.entity.CouponDetail;
import com.ring.model.enums.CouponType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class CouponDetailRepositoryTest extends AbstractRepositoryTest {

        @Autowired
        private CouponRepository couponRepo;

        @Autowired
        private CouponDetailRepository detailRepo;

        @Test
        public void givenNewCouponDetail_whenSaveCouponDetail_ThenReturnCouponDetail() {

                // Given
                Coupon coupon = Coupon.builder()
                                .code("TEST1")
                                .build();
                coupon.setCreatedDate(LocalDateTime.now());
                couponRepo.save(coupon);

                CouponDetail detail = CouponDetail.builder()
                                .usage((short) 99)
                                .discount(BigDecimal.valueOf(0.5))
                                .maxDiscount(1000.0)
                                .attribute(2.0)
                                .expDate(LocalDate.now().plusMonths(1))
                                .type(CouponType.PRODUCT)
                                .coupon(coupon)
                                .build();

                // When
                CouponDetail savedDetail = detailRepo.save(detail);

                // Then
                assertNotNull(savedDetail);
                assertNotNull(savedDetail.getId());
        }

        @Test
        public void whenUpdateBookDetail_ThenReturnUpdatedBookDetail() {

                // Given
                Coupon coupon = Coupon.builder()
                                .code("TEST1")
                                .build();
                coupon.setCreatedDate(LocalDateTime.now());
                couponRepo.save(coupon);

                CouponDetail detail = CouponDetail.builder()
                                .usage((short) 99)
                                .discount(BigDecimal.valueOf(0.5))
                                .maxDiscount(1000.0)
                                .attribute(2.0)
                                .expDate(LocalDate.now().plusMonths(1))
                                .type(CouponType.PRODUCT)
                                .coupon(coupon)
                                .build();
                detailRepo.save(detail);

                CouponDetail foundDetail = detailRepo.findById(detail.getId()).orElse(null);
                assertNotNull(foundDetail);

                // When
                foundDetail.setAttribute(10000.0);
                foundDetail.setType(CouponType.PRODUCT);

                CouponDetail updatedDetail = detailRepo.save(foundDetail);

                // Then
                assertNotNull(updatedDetail);
                assertEquals(10000.0, updatedDetail.getAttribute());
                assertEquals(CouponType.PRODUCT, updatedDetail.getType());
        }

        @Test
        public void whenDeleteBookDetail_ThenFindNull() {

                // Given
                Coupon coupon = Coupon.builder()
                                .code("TEST1")
                                .build();
                coupon.setCreatedDate(LocalDateTime.now());
                couponRepo.save(coupon);

                CouponDetail detail = CouponDetail.builder()
                                .usage((short) 99)
                                .discount(BigDecimal.valueOf(0.5))
                                .maxDiscount(1000.0)
                                .attribute(2.0)
                                .expDate(LocalDate.now().plusMonths(1))
                                .type(CouponType.PRODUCT)
                                .coupon(coupon)
                                .build();
                detailRepo.save(detail);

                // When
                detailRepo.deleteById(detail.getId());

                // Then
                CouponDetail foundDetail = detailRepo.findById(detail.getId()).orElse(null);
                Coupon foundCoupon = couponRepo.findById(coupon.getId()).orElse(null);

                assertNull(foundDetail);
                assertNotNull(foundCoupon);
        }

}