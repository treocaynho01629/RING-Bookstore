package com.ring.repository;

import com.ring.base.AbstractRepositoryTest;
import com.ring.dto.projection.orders.IOrder;
import com.ring.dto.projection.orders.IOrderDetail;
import com.ring.model.entity.*;
import com.ring.model.enums.OrderStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class OrderDetailRepositoryTest extends AbstractRepositoryTest {

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
        private Account account;
        private OrderReceipt receipt;
        private OrderDetail detail;
        private OrderItem item;

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

                Address address = Address.builder()
                                .address("123/abc/j12")
                                .build();
                Address address2 = Address.builder()
                                .address("321/abc/j12")
                                .build();

                addressRepo.saveAll(new ArrayList<>(List.of(address, address2)));

                receipt = OrderReceipt.builder()
                                .user(account)
                                .address(address)
                                .build();
                OrderReceipt receipt2 = OrderReceipt.builder()
                                .user(account)
                                .address(address2)
                                .build();
                receipt.setCreatedDate(LocalDateTime.now());
                receipt2.setCreatedDate(LocalDateTime.now());
                List<OrderReceipt> receipts = new ArrayList<>(List.of(receipt, receipt2));
                receiptRepo.saveAll(receipts);

                detail = OrderDetail.builder()
                                .order(receipt)
                                .status(OrderStatus.PENDING)
                                .shop(shop)
                                .build();
                OrderDetail detail2 = OrderDetail.builder()
                                .order(receipt)
                                .status(OrderStatus.COMPLETED)
                                .shop(shop)
                                .build();
                OrderDetail detail3 = OrderDetail.builder()
                                .order(receipt2)
                                .status(OrderStatus.COMPLETED)
                                .shop(shop)
                                .build();
                detail.setCreatedDate(LocalDateTime.now());
                detail2.setCreatedDate(LocalDateTime.now());
                detail3.setCreatedDate(LocalDateTime.now());
                List<OrderDetail> details = new ArrayList<>(List.of(detail, detail2, detail3));
                detailRepo.saveAll(details);

                item = OrderItem.builder()
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
        public void givenNewOrderDetail_whenSaveOrderDetail_ThenReturnOrderDetail() {

                // Given
                OrderDetail detail4 = OrderDetail.builder()
                                .order(receipt)
                                .status(OrderStatus.PENDING)
                                .build();
                detailRepo.save(detail4);

                // When
                OrderDetail savedDetail = detailRepo.save(detail4);

                // Then
                assertNotNull(savedDetail);
                assertNotNull(savedDetail.getId());
        }

        @Test
        public void whenUpdateOrderDetail_ThenReturnUpdatedOrderDetail() {

                // Given
                OrderDetail foundDetail = detailRepo.findById(detail.getId()).orElse(null);
                assertNotNull(foundDetail);

                // When
                foundDetail.setStatus(OrderStatus.CANCELED);
                foundDetail.setDiscount(10000.0);
                OrderDetail updatedDetail = detailRepo.save(foundDetail);

                // Then
                assertNotNull(updatedDetail);
                assertNotNull(updatedDetail.getDiscount());
                assertEquals(OrderStatus.CANCELED, updatedDetail.getStatus());
        }

        @Test
        public void whenDeleteOrderDetail_ThenFindNull() {

                // Given
                OrderDetail beforeChange = detailRepo.findById(detail.getId()).orElse(null);
                assertNotNull(beforeChange);
                Coupon coupon = Coupon.builder()
                                .code("TEST1")
                                .shop(shop)
                                .build();
                coupon.setCreatedDate(LocalDateTime.now());
                couponRepo.save(coupon);
                beforeChange.setCoupon(coupon);
                detailRepo.save(beforeChange);

                // When
                detailRepo.deleteById(detail.getId());

                // Then
                OrderDetail foundDetail = detailRepo.findById(detail.getId()).orElse(null);
                OrderItem foundItem = itemRepo.findById(item.getId()).orElse(null);
                OrderReceipt foundReceipt = receiptRepo.findById(receipt.getId()).orElse(null);
                Shop foundShop = shopRepo.findById(shop.getId()).orElse(null);
                Coupon foundCoupon = couponRepo.findById(coupon.getId()).orElse(null);

                assertNull(foundDetail);
                assertNull(foundItem);
                assertNotNull(foundReceipt);
                assertNotNull(foundShop);
                assertNotNull(foundCoupon);
        }

        @Test
        public void whenFindDetailById_ThenReturnDetail() {

                // When
                OrderDetail foundDetail = detailRepo.findDetailById(detail.getId()).orElse(null);

                // Then
                assertNotNull(foundDetail);
                assertEquals(detail.getId(), foundDetail.getId());
        }

        @Test
        public void whenFindOrderDetailById_ThenReturnOrderDetail() {

                // When
                IOrderDetail foundDetail = detailRepo.findOrderDetail(detail.getId(), null).orElse(null);

                // Then
                assertNotNull(foundDetail);
                assertEquals(detail.getId(), foundDetail.getId());
        }

        @Test
        public void whenFindAllByUserId_ThenReturnPagedResult() {

                // When
                Pageable pageable = PageRequest.of(0, 10);
                Page<IOrder> foundOrders = detailRepo.findAllByUserId(account.getId(),
                                OrderStatus.COMPLETED,
                                "",
                                pageable);

                // Then
                assertNotNull(foundOrders);
                assertEquals(2, foundOrders.getTotalElements());
        }

        // @Test
        // public void whenFindAllByBookId_ThenReturnPagedResult() {

        //         // When
        //         Pageable pageable = PageRequest.of(0, 10);
        //         Page<IOrder> foundOrders = detailRepo.findAllByBookId(book.getId(), pageable);

        //         // Then
        //         assertNotNull(foundOrders);
        //         assertEquals(2, foundOrders.getTotalElements());
        // }

        @Test
        public void whenFindAllByReceiptId_ThenReturnOrders() {

                // When
                List<IOrder> foundOrders = detailRepo.findAllByReceiptId(receipt.getId());

                // Then
                assertNotNull(foundOrders);
                assertEquals(2, foundOrders.size());
        }

        @Test
        public void whenFindAllByReceiptIds_ThenReturnOrderDetails() {

                // When
                List<IOrder> orderDetails = detailRepo.findAllByReceiptIds(
                                new ArrayList<>(List.of(receipt.getId())));

                // Then
                assertNotNull(orderDetails);
                assertEquals(2, orderDetails.size());
        }
}