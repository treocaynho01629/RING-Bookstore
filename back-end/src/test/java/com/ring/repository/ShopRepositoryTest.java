package com.ring.repository;

import com.ring.base.AbstractRepositoryTest;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.dto.projection.shops.*;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class ShopRepositoryTest extends AbstractRepositoryTest {

    @Autowired
    private ShopRepository shopRepo;

    @Autowired
    private AccountRepository accountRepo;

    @Autowired
    private BookRepository bookRepo;

    @Autowired
    private BookDetailRepository bookDetailRepo;

    @Autowired
    private ImageRepository imageRepo;

    @Autowired
    private CouponRepository couponRepo;

    @Autowired
    private CouponDetailRepository couponDetailRepo;

    @Autowired
    private AddressRepository addressRepo;

    @Autowired
    private OrderDetailRepository orderDetailRepo;

    @Autowired
    private OrderReceiptRepository orderReceiptRepo;

    @Autowired
    private OrderItemRepository orderItemRepo;

    @PersistenceContext
    private EntityManager entityManager;

    private Account account;
    private Shop shop;
    private Image image;
    private Book book;

    @BeforeEach
    void setUp() {
        account = Account.builder()
                .username("initial")
                .pass("asd")
                .email("initialEmail@initial.com")
                .build();
        Account account2 = Account.builder()
                .username("test")
                .pass("test")
                .email("test@test.com")
                .build();
        account.setCreatedDate(LocalDateTime.now());
        account2.setCreatedDate(LocalDateTime.now());
        List<Account> accounts = new ArrayList<>(List.of(account, account2));
        accountRepo.saveAll(accounts);

        image = Image.builder().name("image").build();

        shop = Shop.builder()
                .owner(account)
                .image(image)
                .followers(new HashSet<>(Set.of(account2, account)))
                .name("test")
                .build();
        Shop shop2 = Shop.builder()
                .owner(account)
                .name("test2")
                .followers(new HashSet<>(Set.of(account2)))
                .build();
        Shop shop3 = Shop.builder()
                .owner(account2)
                .name("test3")
                .build();
        shop.setCreatedDate(LocalDateTime.now().minusMonths(1));
        shop2.setCreatedDate(LocalDateTime.now().minusMonths(1));
        shop3.setCreatedDate(LocalDateTime.now());
        List<Shop> shops = new ArrayList<>(List.of(shop, shop2, shop3));
        shopRepo.saveAll(shops);

        Image image2 = Image.builder().name("image2").build();
        Image image3 = Image.builder().name("image3").build();
        book = Book.builder()
                .image(image2)
                .shop(shop)
                .build();
        Book book2 = Book.builder()
                .image(image3)
                .shop(shop2)
                .build();
        book.setCreatedDate(LocalDateTime.now());
        book2.setCreatedDate(LocalDateTime.now());
        bookRepo.saveAll(new ArrayList<>(List.of(book, book2)));

        entityManager.flush();
        entityManager.clear();
    }

    @Test
    public void givenNewShop_whenSaveShop_ThenReturnShop() {

        // Given
        Shop shop = Shop.builder()
                .name("test4")
                .owner(account)
                .build();

        // When
        Shop savedShop = shopRepo.save(shop);

        // Then
        assertNotNull(savedShop);
        assertNotNull(savedShop.getId());
    }

    @Test
    public void whenUpdateShop_ThenReturnUpdatedShop() {

        // Given
        Shop foundShop = shopRepo.findById(shop.getId()).orElse(null);
        assertNotNull(foundShop);

        // When
        foundShop.setName("changed");
        foundShop.setDescription("test description");

        Shop updatedShop = shopRepo.save(foundShop);

        // Then
        assertNotNull(updatedShop);
        assertNotNull(updatedShop.getDescription());
        assertEquals("changed", updatedShop.getName());
    }

    @Test
    public void whenDeleteShop_ThenFindNull() {

        // Given
        Shop beforeChangeShop = shopRepo.findById(shop.getId()).orElse(null);
        assertNotNull(beforeChangeShop);

        OrderDetail detail = OrderDetail.builder()
                .status(OrderStatus.PENDING)
                .shop(shop)
                .build();
        detail.setCreatedDate(LocalDateTime.now());
        orderDetailRepo.save(detail);

        Coupon coupon = Coupon.builder()
                .code("DISCOUNT10")
                .build();
        coupon.setCreatedDate(LocalDateTime.now());
        couponRepo.save(coupon);

        CouponDetail couponDetail = CouponDetail.builder()
                .usage((short) 99)
                .discount(BigDecimal.valueOf(0.5))
                .maxDiscount(1000.0)
                .attribute(2.0)
                .expDate(LocalDate.now().plusMonths(1))
                .type(CouponType.PRODUCT)
                .coupon(coupon)
                .build();
        couponDetailRepo.save(couponDetail);

        Address address = Address.builder().address("123/abc/j12").build();
        addressRepo.save(address);

        beforeChangeShop.addCoupon(coupon);
        beforeChangeShop.setAddress(address);
        shopRepo.save(beforeChangeShop);

        Book beforeChangeBook = bookRepo.findById(book.getId()).orElse(null);
        assertNotNull(beforeChangeBook);

        BookDetail bookDetail = BookDetail.builder().pages(123).book(beforeChangeBook).build();
        bookDetailRepo.save(bookDetail);

        beforeChangeBook.setDetail(bookDetail);
        bookRepo.save(beforeChangeBook);

        entityManager.flush();
        entityManager.clear();

        // When
        shopRepo.deleteById(shop.getId());

        // Then
        Shop foundShop = shopRepo.findById(shop.getId()).orElse(null);
        Image foundImage = imageRepo.findById(image.getId()).orElse(null);
        Address foundAddress = addressRepo.findById(address.getId()).orElse(null);
        Account foundAccount = accountRepo.findById(account.getId()).orElse(null);
        OrderDetail foundDetail = orderDetailRepo.findById(detail.getId()).orElse(null);
        Coupon foundCoupon = couponRepo.findById(coupon.getId()).orElse(null);
        Book foundBook = bookRepo.findById(book.getId()).orElse(null);

        assertNull(foundShop);
        assertNull(foundImage);
        assertNull(foundAddress);
        assertNull(foundCoupon);
        assertNull(foundBook);
        assertNotNull(foundAccount);
        assertNotNull(foundDetail);
    }

    @Test
    public void whenFindShopsDisplay_ThenReturnShopsDisplay() {

        // When
        Pageable pageable = PageRequest.of(0, 10);
        Page<IShopDisplay> foundShops = shopRepo.findShopsDisplay(
                "",
                true,
                account.getId(),
                pageable);

        // Then
        assertNotNull(foundShops);
        assertEquals(1, foundShops.getContent().size());
    }

    @Test
    public void whenFindShops_ThenReturnShops() {

        // When
        Pageable pageable = PageRequest.of(0, 10);
        Page<IShop> foundShops = shopRepo.findShops(
                "",
                account.getId(),
                pageable);

        // Then
        assertNotNull(foundShops);
        assertEquals(2, foundShops.getContent().size());
    }

    @Test
    public void whenFindShops_withDuplicateLineQuantities_thenTotalOrdersSumsAllLines() {

        Address address = Address.builder().address("find-shops-agg").build();
        addressRepo.save(address);

        OrderReceipt receipt = OrderReceipt.builder()
                .user(account)
                .address(address)
                .total(100.0)
                .totalDiscount(10.0)
                .build();
        receipt.setCreatedDate(LocalDateTime.now());
        orderReceiptRepo.save(receipt);

        OrderDetail completed = OrderDetail.builder()
                .order(receipt)
                .shop(shop)
                .status(OrderStatus.COMPLETED)
                .build();
        completed.setCreatedDate(LocalDateTime.now());
        orderDetailRepo.save(completed);

        OrderItem line1 = OrderItem.builder().detail(completed).book(book).quantity((short) 2).build();
        OrderItem line2 = OrderItem.builder().detail(completed).book(book).quantity((short) 2).build();
        orderItemRepo.saveAll(List.of(line1, line2));

        entityManager.flush();
        entityManager.clear();

        Pageable pageable = PageRequest.of(0, 10);
        Page<IShop> foundShops = shopRepo.findShops("", account.getId(), pageable);
        IShop row = foundShops.getContent().stream()
                .filter(s -> s.getId().equals(shop.getId()))
                .findFirst()
                .orElseThrow();

        assertEquals(4, row.getTotalOrders());
        assertEquals(90.0, row.getSales(), 0.001);
        assertEquals(0.0, row.getCanceledRate(), 0.001);
    }

    @Test
    public void whenFindShopsPreview_ThenReturnShopsPreview() {

        // When
        List<IShopPreview> foundShops = shopRepo.findShopsPreview(account.getId());

        // Then
        assertNotNull(foundShops);
        assertEquals(2, foundShops.size());
    }

    @Test
    public void whenFindShopsInIds_ThenReturnShops() {

        // Given
        List<Shop> shops = shopRepo.findAll();
        List<Long> foundIds = shops.stream().map(Shop::getId).collect(Collectors.toList());
        foundIds.remove(0);

        // When
        List<Shop> foundShops = shopRepo.findShopsInIds(foundIds);

        // Then
        assertNotNull(foundShops);
        assertEquals(2, foundShops.size());
    }

    @Test
    public void whenFindShopIdsByInIdsAndOwner_ThenReturnIds() {

        // Given
        List<Shop> shops = shopRepo.findAll();
        List<Long> ids = shops.stream().map(Shop::getId).collect(Collectors.toList());

        // When
        List<Long> foundIds = shopRepo.findShopIdsByInIdsAndOwner(ids, account.getId());

        // Then
        assertNotNull(foundIds);
        assertEquals(2, foundIds.size());
    }

    @Test
    public void whenFindInverseIds_ThenReturnIds() {

        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<IShop> shops = shopRepo.findShops(
                "",
                account.getId(),
                pageable);
        List<Long> ids = shops.getContent().stream().map(IShop::getId).collect(Collectors.toList());
        ids.remove(0);

        // When
        List<Long> foundIds = shopRepo.findInverseIds(
                "",
                account.getId(),
                ids);

        // Then
        assertNotNull(foundIds);
        assertEquals(1, foundIds.size());
    }

    @Test
    public void whenFindShopInfoById_ThenReturnShopInfo() {

        // When
        IShopInfo foundShop = shopRepo.findShopInfoById(shop.getId(), account.getId()).orElse(null);

        // Then
        assertNotNull(foundShop);
        assertEquals(account.getUsername(), foundShop.getUsername());
        assertEquals(shop.getName(), foundShop.getName());
    }

    @Test
    public void whenFindShopDisplayDetailById_ThenReturnShopDisplayDetail() {

        // When
        IShopDisplayDetail foundShop = shopRepo.findShopDisplayDetailById(shop.getId(), account.getId()).orElse(null);

        // Then
        assertNotNull(foundShop);
        assertEquals(account.getUsername(), foundShop.getUsername());
        assertEquals(shop.getName(), foundShop.getName());
    }

    @Test
    public void whenFindShopDetailById_ThenReturnShopDetail() {

        // When
        IShopDetail foundShop = shopRepo.findShopDetailById(shop.getId(), account.getId()).orElse(null);

        // Then
        assertNotNull(foundShop);
        assertEquals(account.getUsername(), foundShop.getUsername());
        assertEquals(shop.getName(), foundShop.getName());
    }

    @Test
    public void whenGetShopAnalytics_ThenReturnStats() {

        // When
        IStat foundData = shopRepo.getShopAnalytics(null);

        // Then
        assertNotNull(foundData);
        assertEquals(3, foundData.getTotal());
        assertEquals(2, foundData.getLastMonth());
        assertEquals(1, foundData.getCurrentMonth());
    }
}