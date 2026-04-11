package com.ring.repository;

import com.ring.base.AbstractRepositoryTest;
import com.ring.dto.projection.orders.IOrderSummary;
import com.ring.model.entity.*;
import com.ring.model.enums.OrderStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class OrderReceiptRepositoryTest extends AbstractRepositoryTest {

        @Autowired
        private ShopRepository shopRepo;

        @Autowired
        private BookRepository bookRepo;

        @Autowired
        private AccountRepository accountRepo;

        @Autowired
        private AddressRepository addressRepo;

        @Autowired
        private OrderReceiptRepository receiptRepo;

        @Autowired
        private OrderDetailRepository detailRepo;

        @Autowired
        private OrderItemRepository itemRepo;

        @Autowired
        private CouponRepository couponRepo;

        @PersistenceContext
        private EntityManager entityManager;

        private Book book;
        private Shop shop;
        private Address address;
        private Account account;
        private OrderReceipt receipt;
        private OrderDetail detail;

        @BeforeEach
        void setUp() {
                account = Account.builder()
                                .username("initial")
                                .pass("asd")
                                .email("initialEmail@initial.com")
                                .build();
                account.setCreatedDate(LocalDateTime.now());
                Account savedAccount = accountRepo.save(account);

                shop = Shop.builder().name("shop").owner(savedAccount).build();
                shop.setCreatedDate(LocalDateTime.now());
                Shop savedShop = shopRepo.save(shop);

                Image image = Image.builder().name("image").build();
                Image image2 = Image.builder().name("image2").build();

                book = Book.builder()
                                .title("test")
                                .image(image)
                                .shop(savedShop)
                                .build();
                Book book2 = Book.builder()
                                .title("test2")
                                .image(image2)
                                .shop(savedShop)
                                .build();
                book.setCreatedDate(LocalDateTime.now());
                book2.setCreatedDate(LocalDateTime.now());
                bookRepo.saveAll(new ArrayList<>(List.of(book, book2)));

                address = Address.builder()
                                .address("123/abc/j12")
                                .build();
                Address address2 = Address.builder()
                                .address("321/abc/j12")
                                .build();
                Address address3 = Address.builder()
                                .address("456/abc/j12")
                                .build();

                addressRepo.saveAll(new ArrayList<>(List.of(address, address2, address3)));

                receipt = OrderReceipt.builder()
                                .user(account)
                                .address(address)
                                .email("test@test.test")
                                .build();
                OrderReceipt receipt2 = OrderReceipt.builder()
                                .user(account)
                                .address(address2)
                                .build();
                OrderReceipt receipt3 = OrderReceipt.builder()
                                .user(account)
                                .address(address3)
                                .build();
                receipt.setCreatedDate(LocalDateTime.now().minusMonths(1));
                receipt.setLastModifiedDate(LocalDateTime.now().minusMonths(1));
                receipt2.setCreatedDate(LocalDateTime.now().minusMonths(1));
                receipt2.setLastModifiedDate(LocalDateTime.now().minusMonths(1));
                receipt3.setCreatedDate(LocalDateTime.now());
                receipt3.setLastModifiedDate(LocalDateTime.now());
                List<OrderReceipt> receipts = new ArrayList<>(List.of(receipt, receipt2, receipt3));
                receiptRepo.saveAll(receipts);

                detail = OrderDetail.builder()
                                .order(receipt)
                                .status(OrderStatus.PENDING)
                                .shop(shop)
                                .totalPrice(90000.0)
                                .discount(10000.0)
                                .build();
                detail.setCreatedDate(LocalDateTime.now().minusMonths(1));
                OrderDetail detail2 = OrderDetail.builder()
                                .order(receipt2)
                                .status(OrderStatus.COMPLETED)
                                .shop(shop)
                                .totalPrice(30000.0)
                                .discount(0.0)
                                .build();
                detail2.setCreatedDate(LocalDateTime.now().minusMonths(1));
                OrderDetail detail3 = OrderDetail.builder()
                                .order(receipt3)
                                .status(OrderStatus.COMPLETED)
                                .shop(shop)
                                .totalPrice(240000.0)
                                .discount(20000.0)
                                .build();
                detail3.setCreatedDate(LocalDateTime.now());
                List<OrderDetail> details = new ArrayList<>(List.of(detail, detail2, detail3));
                detailRepo.saveAll(details);

                OrderItem item = OrderItem.builder()
                                .detail(detail)
                                .book(book)
                                .build();
                OrderItem item2 = OrderItem.builder()
                                .detail(detail2)
                                .book(book)
                                .build();
                OrderItem item3 = OrderItem.builder()
                                .detail(detail3)
                                .book(book2)
                                .build();
                List<OrderItem> items = new ArrayList<>(List.of(item, item2, item3));
                itemRepo.saveAll(items);
                entityManager.flush();
                entityManager.clear();
        }

        @Test
        public void givenNewOrder_whenSaveOrder_ThenReturnOrder() {

                // Given
                OrderReceipt order = OrderReceipt.builder()
                                .user(account)
                                .build();

                // When
                OrderReceipt savedOrder = receiptRepo.save(order);

                // Then
                assertNotNull(savedOrder);
                assertNotNull(savedOrder.getId());
        }

        @Test
        public void whenUpdateOrder_ThenReturnUpdatedOrder() {

                // Given
                OrderReceipt foundOrder = receiptRepo.findById(receipt.getId()).orElse(null);
                assertNotNull(foundOrder);

                // When
                foundOrder.setEmail("changed@changed.changed");
                foundOrder.setTotal(100000.0);

                OrderReceipt updatedOrder = receiptRepo.save(foundOrder);

                // Then
                assertNotNull(updatedOrder);
                assertNotNull(updatedOrder.getTotal());
                assertEquals("changed@changed.changed", updatedOrder.getEmail());
        }

        @Test
        public void whenDeleteOrder_ThenFindNull() {

                // Given
                OrderReceipt beforeChange = receiptRepo.findById(receipt.getId()).orElse(null);
                assertNotNull(beforeChange);
                Coupon coupon = Coupon.builder()
                                .code("TEST1")
                                .shop(shop)
                                .build();
                coupon.setCreatedDate(LocalDateTime.now());
                couponRepo.save(coupon);
                beforeChange.setCoupon(coupon);
                receiptRepo.save(beforeChange);

                // When
                receiptRepo.deleteById(receipt.getId());

                // Then
                OrderReceipt foundOrder = receiptRepo.findById(receipt.getId()).orElse(null);
                OrderDetail foundDetail = detailRepo.findById(detail.getId()).orElse(null);
                Address foundAddress = addressRepo.findById(address.getId()).orElse(null);
                Account foundAccount = accountRepo.findById(account.getId()).orElse(null);
                Coupon foundCoupon = couponRepo.findById(coupon.getId()).orElse(null);

                assertNull(foundOrder);
                assertNull(foundDetail);
                assertNull(foundAddress);
                assertNotNull(foundCoupon);
                assertNotNull(foundAccount);
        }

        @Test
        public void whenCheckHasUserBoughtBook_ThenReturnBoolean() {

                // When
                boolean check = receiptRepo.hasUserBoughtBook(book.getId(), account.getId());

                // Then
                assertTrue(check);
        }

        @Test
        public void whenFindOrderSummaries_ThenReturnList() {

                // // When
                // Pageable pageable = PageRequest.of(0, 10);
                // Page<IOrderSummary> foundOrders = receiptRepo.findAllSummaries(
                // null,
                // account.getId(),
                // book.getId(),
                // pageable);

                // // Then
                // assertNotNull(foundOrders);
                // assertEquals(2, foundOrders.getTotalElements());
        }

        // @Test
        // public void whenOrderIds_ThenReturnIds() {
        //
        // // When
        // Pageable pageable = PageRequest.of(0, 10);
        // Page<Long> foundIds = receiptRepo.findAllIds(
        // null,
        // account.getId(),
        // OrderStatus.COMPLETED,
        // "",
        // pageable);
        //
        // // Then
        // assertNotNull(foundIds);
        // assertEquals(2, foundIds.getTotalElements());
        // }
        //
        // @Test
        // public void whenGetSalesAnalytics_ThenReturnStats() {
        //
        // // When
        // IStat foundData = receiptRepo.getSalesAnalytics(null, null);
        //
        // // Then
        // assertNotNull(foundData);
        // assertEquals(220000.0, foundData.getCurrentMonth()); //240000 - 20000
        // assertEquals(30000.0, foundData.getLastMonth()); //30000 - 0 (COMPLETED)
        // }
}