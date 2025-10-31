package com.ring.repository;

import com.ring.base.AbstractRepositoryTest;
import com.ring.dto.projection.coupons.ICoupon;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.model.entity.*;
import com.ring.model.enums.CouponType;
import com.ring.model.enums.OrderStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class CouponRepositoryTest extends AbstractRepositoryTest {

    @Autowired
    private CouponRepository couponRepo;

    @Autowired
    private CouponDetailRepository detailRepo;

    @Autowired
    private ShopRepository shopRepo;

    @Autowired
    private AccountRepository accountRepo;

    @Autowired
    private OrderReceiptRepository receiptRepo;

    @Autowired
    private OrderDetailRepository orderDetailRepo;

    @PersistenceContext
    private EntityManager entityManager;

    private Coupon coupon;
    private CouponDetail detail;
    private Account account;
    private Shop shop;
    private OrderReceipt receipt;

    @BeforeEach
    void setUp() {
        account = Account.builder()
                .username("initial")
                .pass("asd")
                .email("initialEmail@initial.com")
                .build();
        account.setCreatedDate(LocalDateTime.now());
        accountRepo.save(account);

        shop = Shop.builder().name("shop").owner(account).build();
        shop.setCreatedDate(LocalDateTime.now());
        shopRepo.save(shop);

        coupon = Coupon.builder()
                .code("TEST1")
                .shop(shop)
                .build();
        Coupon coupon2 = Coupon.builder()
                .code("TEST2")
                .build();
        Coupon coupon3 = Coupon.builder()
                .code("TEST3")
                .build();
        coupon.setCreatedDate(LocalDateTime.now().minusMonths(1));
        coupon2.setCreatedDate(LocalDateTime.now().minusMonths(1));
        coupon3.setCreatedDate(LocalDateTime.now());
        List<Coupon> coupons = new ArrayList<>(List.of(coupon, coupon2, coupon3));
        couponRepo.saveAll(coupons);

        detail = CouponDetail.builder()
                .usage((short) 99)
                .discount(BigDecimal.valueOf(0.5))
                .maxDiscount(1000.0)
                .attribute(2.0)
                .expDate(LocalDate.now().plusMonths(1))
                .type(CouponType.PRODUCT)
                .coupon(coupon)
                .build();
        CouponDetail detail2 = CouponDetail.builder()
                .usage((short) 12)
                .discount(BigDecimal.valueOf(0.9))
                .maxDiscount(20000.0)
                .attribute(20000.0)
                .expDate(LocalDate.now().plusMonths(1))
                .type(CouponType.PRODUCT)
                .coupon(coupon2)
                .build();
        CouponDetail detail3 = CouponDetail.builder()
                .usage((short) 32)
                .discount(BigDecimal.valueOf(1))
                .maxDiscount(100000.0)
                .attribute(20000.0)
                .expDate(LocalDate.now().plusMonths(1))
                .type(CouponType.SHIPPING)
                .coupon(coupon3)
                .build();
        List<CouponDetail> details = new ArrayList<>(List.of(detail, detail2, detail3));
        detailRepo.saveAll(details);

        receipt = OrderReceipt.builder()
                .coupon(coupon)
                .user(account)
                .build();
        receipt.setCreatedDate(LocalDateTime.now());
        receiptRepo.save(receipt);

        OrderDetail orderDetail = OrderDetail.builder()
                .order(receipt)
                .status(OrderStatus.PENDING)
                .build();
        orderDetail.setCreatedDate(LocalDateTime.now());
        orderDetailRepo.save(orderDetail);

        entityManager.flush();
        entityManager.clear();
    }

    @Test
    public void givenNewCoupon_whenSaveCoupon_ThenReturnCoupon() {

        // Given
        Coupon coupon = Coupon.builder()
                .code("DISCOUNT10")
                .build();

        // When
        Coupon savedCoupon = couponRepo.save(coupon);

        // Then
        assertNotNull(savedCoupon);
        assertNotNull(savedCoupon.getId());
    }

    @Test
    public void whenUpdateCoupon_ThenReturnCoupon() {

        // Given
        Coupon foundCoupon = couponRepo.findById(coupon.getId()).orElse(null);
        assertNotNull(foundCoupon);

        // When
        foundCoupon.setCode("TEST29");

        Coupon updatedCoupon = couponRepo.save(foundCoupon);

        // Then
        assertNotNull(updatedCoupon);
        assertEquals("TEST29", updatedCoupon.getCode());
    }

    @Test
    public void whenDeleteCoupon_ThenFindNull() {

        // When
        couponRepo.deleteById(coupon.getId());

        // Then
        Coupon foundCoupon = couponRepo.findById(coupon.getId()).orElse(null);
        CouponDetail foundDetail = detailRepo.findById(detail.getId()).orElse(null);
        Shop foundShop = shopRepo.findById(shop.getId()).orElse(null);
        OrderReceipt foundReceipt = receiptRepo.findById(receipt.getId()).orElse(null);

        assertNull(foundCoupon);
        assertNull(foundDetail);
        assertNotNull(foundShop);
        assertNotNull(foundReceipt);
    }

    @Test
    public void whenCheckHasUserUsedCoupon_ThenReturnBoolean() {

        // When
        boolean check = couponRepo.hasUserUsedCoupon(coupon.getId(), account.getId());

        // Then
        assertTrue(check);
    }

    @Test
    public void whenFindCoupons_ThenReturnCoupons() {

        // When
        Pageable pageable = PageRequest.of(0, 10);
        Page<ICoupon> foundCoupons = couponRepo.findCoupons(
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                true,
                pageable);

        // Then
        assertNotNull(foundCoupons);
        assertEquals(2, foundCoupons.getContent().size());
    }

    @Test
    public void whenFindCouponIdsBySeller_ThenReturnIds() {

        // Given
        List<Coupon> foundCoupons = couponRepo.findAll();
        List<Long> foundIds = foundCoupons.stream().map(Coupon::getId).collect(Collectors.toList());

        // When
        List<Long> couponIds = couponRepo.findCouponIdsByInIdsAndSeller(foundIds, account.getId());

        // Then
        assertNotNull(couponIds);
        assertEquals(1, couponIds.size());
    }

    @Test
    public void whenFindInverseIds_ThenReturnIds() {

        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<ICoupon> foundCoupons = couponRepo.findCoupons(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                true,
                pageable);
        List<Long> foundIds = foundCoupons.getContent().stream().map(projection -> projection.getCoupon().getId())
                .collect(Collectors.toList());
        foundIds.remove(0);

        // When
        List<Long> inverseIds = couponRepo.findInverseIds(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                true,
                foundIds);

        // Then
        assertNotNull(inverseIds);
        assertEquals(foundCoupons.getTotalElements() - foundIds.size(), inverseIds.size());
    }

    @Test
    public void whenFindRecommendCoupons_ThenReturnCoupons() {

        // When
        List<ICoupon> foundCoupons = couponRepo.recommendCoupons(new ArrayList<>(List.of(shop.getId())));

        // Then
        assertNotNull(foundCoupons);
        assertEquals(2, foundCoupons.size());
    }

    @Test
    public void whenFindCouponsInCodes_ThenReturnCoupons() {

        // When
        List<ICoupon> foundCoupons = couponRepo.findCouponInCodes(new ArrayList<>(List.of("TEST1", "TEST2")));

        // Then
        assertNotNull(foundCoupons);
        assertEquals(2, foundCoupons.size());
    }

    @Test
    public void whenFindRecommendCoupon_ThenReturnCoupon() {

        // When
        ICoupon foundCoupon = couponRepo.recommendCoupon(shop.getId(), 1000000.0, 99).orElse(null);

        // Then
        assertNotNull(foundCoupon);
    }

    @Test
    public void whenFindCouponByCode_ThenReturnCoupon() {

        // When
        ICoupon foundCoupon = couponRepo.findCouponByCode("TEST1").orElse(null);

        // Then
        assertNotNull(foundCoupon);
        assertEquals("TEST1", foundCoupon.getCoupon().getCode());
    }

    @Test
    public void whenFindCouponById_ThenReturnCoupon() {

        // When
        ICoupon foundCoupon = couponRepo.findCouponById(coupon.getId()).orElse(null);

        // Then
        assertNotNull(foundCoupon);
        assertEquals(coupon.getId(), foundCoupon.getCoupon().getId());
    }

    @Test
    public void whenGetCouponAnalytics_ThenReturnStats() {

        // When
        IStat foundData = couponRepo.getCouponAnalytics(null, null);

        // Then
        assertNotNull(foundData);
        assertEquals(3, foundData.getTotal());
        assertEquals(2, foundData.getLastMonth());
        assertEquals(1, foundData.getCurrentMonth());
    }

    @Test
    public void whenDecreaseUsage_ThenUsageDecreases() {

        // When
        couponRepo.decreaseUsage(coupon.getId());
        entityManager.flush();
        entityManager.clear();

        // Then
        Coupon foundCoupon = couponRepo.findById(coupon.getId()).orElse(null);

        assertNotNull(foundCoupon);
        assertEquals(98, (short) foundCoupon.getDetail().getUsage());
    }
}