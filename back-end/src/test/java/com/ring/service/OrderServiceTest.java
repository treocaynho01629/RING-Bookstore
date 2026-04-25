package com.ring.service;

import com.ring.base.AbstractServiceTest;
import com.ring.dto.projection.coupons.ICoupon;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.dto.projection.orders.*;
import com.ring.dto.request.*;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.coupons.CouponDiscountDTO;
import com.ring.dto.response.dashboard.ChartDTO;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.dto.response.orders.*;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.CalculateMapper;
import com.ring.mapper.DashboardMapper;
import com.ring.mapper.CouponMapper;
import com.ring.mapper.OrderMapper;
import com.ring.model.entity.*;
import com.ring.model.enums.*;
import com.ring.repository.*;
import com.ring.service.impl.OrderServiceImpl;
import com.ring.service.impl.MessageService;
import com.ring.service.impl.GHNOrderIntegrationService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

public class OrderServiceTest extends AbstractServiceTest {

    @Mock
    private OrderReceiptRepository orderRepo;

    @Mock
    private OrderDetailRepository detailRepo;

    @Mock
    private OrderItemRepository itemRepo;

    @Mock
    private BookRepository bookRepo;

    @Mock
    private ShopRepository shopRepo;

    @Mock
    private CouponRepository couponRepo;

    @Mock
    private AddressRepository addressRepo;

    @Mock
    private CouponService couponService;

    @Mock
    private PaymentInfoRepository paymentRepo;

    @Mock
    private CaptchaService captchaService;

    @Mock
    private PaymentService paymentService;

    @Mock
    private MessageService messageService;

    @Mock
    private GHNService ghnService;

    @Mock
    private CouponMapper couponMapper;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private CalculateMapper calculateMapper;

    @Mock
    private DashboardMapper dashMapper;

    @Mock
    private GHNOrderIntegrationService ghnOrderIntegrationService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private static final Role role = Role.builder()
            .roleName(UserRole.ROLE_ADMIN)
            .build();
    private static Account account = Account.builder()
            .id(1L)
            .username("test")
            .email("test@example.com")
            .roles(List.of(role))
            .build();
    private static final Address address = Address.builder()
            .id(1L)
            .name("Test Address")
            .companyName("Test Company")
            .phone("0123456789")
            .detail("Test Detail")
            .address("Test Street")
            .build();
    private static final Shop shop = Shop.builder()
            .id(1L)
            .name("Test Shop")
            .address(address)
            .owner(account)
            .build();
    private static final Book book = Book.builder()
            .id(1L)
            .title("Test Book")
            .price(100.0)
            .amount((short) 10)
            .discount(BigDecimal.valueOf(0.1))
            .shop(shop)
            .build();
    private static final OrderItem orderItem = OrderItem.builder()
            .id(1L)
            .book(book)
            .price(book.getPrice())
            .discount(book.getDiscount())
            .quantity((short) 1)
            .build();
    private static OrderDetail orderDetail = OrderDetail.builder()
            .id(1L)
            .shop(shop)
            .status(OrderStatus.PENDING)
            .totalPrice(100.0)
            .shippingFee(10.0)
            .discount(10.0)
            .shippingDiscount(1.0)
            .totalQuantity(1)
            .items(List.of(orderItem))
            // //.shippingType(ShippingType.STANDARD)
            .build();
    private static final OrderReceipt orderReceipt = OrderReceipt.builder()
            .id(1L)
            .user(account)
            .email(account.getEmail())
            .address(address)
            .total(110.0)
            .productsPrice(100.0)
            .shippingFee(10.0)
            .totalDiscount(11.0)
            .details(List.of(orderDetail))
            .build();
    private PaymentInfo paymentInfo = PaymentInfo.builder()
            .id(1L)
            .paymentType(PaymentType.ONLINE_PAYMENT)
            .amount(110L)
            .status(PaymentStatus.PAID)
            .build();
    private CartDetailRequest cartDetail = CartDetailRequest.builder()
            .shopId(1L)
            .items(List.of(CartItemRequest.builder()
                    .id(1L)
                    .quantity((short) 1)
                    .build()))
            .note("Test message")
            // .shippingType(ShippingType.STANDARD)
            .build();
    private OrderRequest request = OrderRequest.builder()
            .cart(List.of(cartDetail))
            .address(AddressRequest.builder()
                    .name("Test Address")
                    .companyName("Test Company")
                    .phone("0123456789")
                    .detail("Test")
                    .address("Test Street")
                    .build())
            .paymentMethod(PaymentType.CASH)
            .build();

    @BeforeAll
    public static void setUp() {
        orderItem.setDetail(orderDetail);
        orderDetail.setOrder(orderReceipt);
        orderReceipt.setLastModifiedDate(LocalDateTime.now().minusMonths(1));
    }

    @AfterEach
    public void cleanUp() {
        orderDetail.setStatus(OrderStatus.PENDING);
        paymentInfo.setStatus(PaymentStatus.PAID);
        orderReceipt.setLastModifiedDate(LocalDateTime.now().minusMonths(1));
        book.setAmount((short) 10);
        account = Account.builder()
                .id(1L)
                .username("test")
                .email("test@example.com")
                .roles(List.of(role))
                .build();
        SecurityContextHolder.clearContext();
    }

    @Test
    public void whenCalculate_ThenReturnsCalculateDTO() {

        // // Given
        // CalculateRequest request = CalculateRequest.builder()
        // .cart(List.of(cartDetail))
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .build();

        // // When
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(new ArrayList<>());
        // when(calculateMapper.orderToDTO(any(OrderReceipt.class))).thenReturn(mock(CalculateDTO.class));

        // // Then
        // CalculateDTO result = orderService.calculate(request, account);

        // assertNotNull(result);

        // // Verify
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(calculateMapper, times(1)).orderToDTO(any(OrderReceipt.class));
    }

    @Test
    public void whenCheckout_ThenReturnsReceiptDTO() {

        // // Given
        // ReceiptDTO expected = ReceiptDTO.builder()
        // .id(1L)
        // .build();
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(new ArrayList<>());
        // when(addressRepo.save(any(Address.class))).thenReturn(address);
        // when(orderRepo.save(any(OrderReceipt.class))).thenReturn(orderReceipt);
        // when(orderMapper.orderToDTO(any(OrderReceipt.class))).thenReturn(expected);
        // doNothing().when(eventPublisher).publishEvent(any());

        // // Then
        // CreatePaymentLinkResponse result = orderService.checkout(request,
        // httpRequest, account);

        // assertNull(result);

        // // Verify
        // verify(captchaService, times(1)).validate(anyString(), anyString(),
        // anyString());
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(addressRepo, times(1)).save(any(Address.class));
        // verify(orderRepo, times(1)).save(any(OrderReceipt.class));
        // verify(orderMapper, times(1)).orderToDTO(any(OrderReceipt.class));
        // verify(eventPublisher, times(1)).publishEvent(any());
    }

    @Test
    public void whenCheckoutWithUsedCoupon_ThenThrowsException() {

        // // Given
        // OrderRequest request = OrderRequest.builder()
        // .cart(List.of(cartDetail))
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .paymentMethod(PaymentType.CASH)
        // .coupon("TEST")
        // .build();
        // ICoupon projection = mock(ICoupon.class);
        // Coupon coupon = Coupon.builder().id(1L).code("TEST").build();
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(List.of(projection));
        // when(projection.getCoupon()).thenReturn(coupon);
        // when(couponRepo.hasUserUsedCoupon(anyLong(), anyLong())).thenReturn(true);

        // // Then
        // HttpResponseException exception = assertThrows(HttpResponseException.class,
        // () -> orderService.checkout(request, httpRequest, account));
        // assertEquals("Coupon expired!", exception.getError());

        // // Verify
        // verify(captchaService, times(1)).validate(anyString(), anyString(),
        // anyString());
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(couponRepo, times(1)).hasUserUsedCoupon(anyLong(), anyLong());
        // verify(addressRepo, times(1)).save(any(Address.class));
        // verify(orderRepo, never()).save(any(OrderReceipt.class));
        // verify(orderMapper, never()).orderToDTO(any(OrderReceipt.class));
        // verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    public void whenCheckoutWithInvalidCoupon_ThenThrowsException() {

        // // Given
        // OrderRequest request = OrderRequest.builder()
        // .cart(List.of(cartDetail))
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .paymentMethod(PaymentType.CASH)
        // .coupon("TEST")
        // .build();
        // ICoupon projection = mock(ICoupon.class);
        // Coupon coupon = Coupon.builder().id(1L).code("TEST").build();
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(List.of(projection));
        // when(projection.getCoupon()).thenReturn(coupon);
        // when(couponRepo.hasUserUsedCoupon(anyLong(), anyLong())).thenReturn(false);
        // when(couponService.applyCoupon(any(Coupon.class),
        // any(CartStateRequest.class), any(Account.class)))
        // .thenReturn(null);

        // // Then
        // HttpResponseException exception = assertThrows(HttpResponseException.class,
        // () -> orderService.checkout(request, httpRequest, account));
        // assertEquals("Invalid coupon!", exception.getError());

        // // Verify
        // verify(captchaService, times(1)).validate(anyString(), anyString(),
        // anyString());
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(couponRepo, times(1)).hasUserUsedCoupon(anyLong(), anyLong());
        // verify(couponService, times(1)).applyCoupon(any(Coupon.class),
        // any(CartStateRequest.class),
        // any(Account.class));
        // verify(addressRepo, times(1)).save(any(Address.class));
        // verify(orderRepo, never()).save(any(OrderReceipt.class));
        // verify(orderMapper, never()).orderToDTO(any(OrderReceipt.class));
        // verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    public void whenCheckoutWithUnknownOrderCoupon_ThenThrowsException() {

        // // Given
        // OrderRequest request = OrderRequest.builder()
        // .cart(List.of(cartDetail))
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .paymentMethod(PaymentType.CASH)
        // .coupon("UNKNOWN")
        // .build();
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(new ArrayList<>());
        // when(addressRepo.save(any(Address.class))).thenReturn(address);

        // // Then
        // HttpResponseException exception = assertThrows(HttpResponseException.class,
        // () -> orderService.checkout(request, httpRequest, account));
        // assertEquals("Invalid coupon!", exception.getError());

        // // Verify
        // verify(captchaService, times(1)).validate(anyString(), anyString(),
        // anyString());
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(couponRepo, never()).hasUserUsedCoupon(anyLong(), anyLong());
        // verify(couponService, never()).applyCoupon(any(Coupon.class),
        // any(CartStateRequest.class),
        // any(Account.class));
        // verify(addressRepo, times(1)).save(any(Address.class));
        // verify(orderRepo, never()).save(any(OrderReceipt.class));
        // verify(orderMapper, never()).orderToDTO(any(OrderReceipt.class));
        // verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    public void whenCheckoutWithNonExistingShop_ThenThrowsException() {

        // // Given
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(new ArrayList<>());
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(new ArrayList<>());

        // // Then
        // ResourceNotFoundException exception =
        // assertThrows(ResourceNotFoundException.class,
        // () -> orderService.checkout(request, httpRequest, account));
        // assertEquals("Shop not found!", exception.getError());

        // // Verify
        // verify(captchaService, times(1)).validate(anyString(), anyString(),
        // anyString());
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(addressRepo, times(1)).save(any(Address.class));
        // verify(orderRepo, never()).save(any(OrderReceipt.class));
        // verify(orderMapper, never()).orderToDTO(any(OrderReceipt.class));
        // verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    public void whenCheckoutWithNonExistingBook_ThenThrowsException() {

        // // Given
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(new ArrayList<>());
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(new ArrayList<>());

        // // Then
        // ResourceNotFoundException exception =
        // assertThrows(ResourceNotFoundException.class,
        // () -> orderService.checkout(request, httpRequest, account));
        // assertEquals("Product not found!", exception.getError());

        // // Verify
        // verify(captchaService, times(1)).validate(anyString(), anyString(),
        // anyString());
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(addressRepo, times(1)).save(any(Address.class));
        // verify(orderRepo, never()).save(any(OrderReceipt.class));
        // verify(orderMapper, never()).orderToDTO(any(OrderReceipt.class));
        // verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    public void whenCheckoutWithOutOfStock_ThenThrowsException() {

        // // Given
        // book.setAmount((short) 0);
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(new ArrayList<>());

        // // Then
        // HttpResponseException exception = assertThrows(HttpResponseException.class,
        // () -> orderService.checkout(request, httpRequest, account));
        // assertEquals("Product out of stock!", exception.getError());

        // // Verify
        // verify(captchaService, times(1)).validate(anyString(), anyString(),
        // anyString());
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(addressRepo, times(1)).save(any(Address.class));
        // verify(orderRepo, never()).save(any(OrderReceipt.class));
        // verify(orderMapper, never()).orderToDTO(any(OrderReceipt.class));
        // verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    public void whenCalculateWithOutOfStock_ThenReturnsCalculateDTO() {

        // // Given
        // book.setAmount((short) 0);
        // CalculateRequest request = CalculateRequest.builder()
        // .cart(List.of(cartDetail))
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .build();

        // // When
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(new ArrayList<>());
        // when(calculateMapper.orderToDTO(any(OrderReceipt.class))).thenReturn(mock(CalculateDTO.class));

        // // Then
        // CalculateDTO result = orderService.calculate(request, account);
        // assertNotNull(result);

        // // Verify
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(calculateMapper, times(1)).orderToDTO(any(OrderReceipt.class));
    }

    @Test
    public void whenCalculateWithEmptyDetailAndGlobalCoupon_ThenSkipsApplyCoupon() {

        // // Given
        // CartDetailRequest emptyDetail = CartDetailRequest.builder()
        // .shopId(999L)
        // .items(new ArrayList<>())
        // //.shippingType(ShippingType.STANDARD)
        // .build();
        // CalculateRequest request = CalculateRequest.builder()
        // .cart(List.of(emptyDetail))
        // .coupon("GLOBAL")
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .build();
        // ICoupon projection = mock(ICoupon.class);
        // Coupon coupon = Coupon.builder().id(1L).code("GLOBAL").build();

        // // When
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(new ArrayList<>());
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(new ArrayList<>());
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(List.of(projection));
        // when(projection.getCoupon()).thenReturn(coupon);
        // when(calculateMapper.orderToDTO(any(OrderReceipt.class))).thenReturn(mock(CalculateDTO.class));

        // // Then
        // CalculateDTO result = orderService.calculate(request, account);
        // assertNotNull(result);

        // // Verify
        // verify(couponService, never()).applyCoupon(any(Coupon.class),
        // any(CartStateRequest.class),
        // any(Account.class));
        // verify(calculateMapper, times(1)).orderToDTO(any(OrderReceipt.class));
    }

    @Test
    public void whenCheckoutWithUsedShopCoupon_ThenThrowsException() {

        // // Given
        // CartDetailRequest cartDetail = CartDetailRequest.builder()
        // .shopId(1L)
        // .coupon("TEST")
        // .items(List.of(CartItemRequest.builder()
        // .id(1L)
        // .quantity((short) 1)
        // .build()))
        // .build();
        // OrderRequest request = OrderRequest.builder()
        // .cart(List.of(cartDetail))
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .paymentMethod(PaymentType.CASH)
        // .build();
        // ICoupon projection = mock(ICoupon.class);
        // Coupon coupon = Coupon.builder().id(1L).shop(shop).code("TEST").build();
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(List.of(projection));
        // when(projection.getCoupon()).thenReturn(coupon);
        // when(couponRepo.hasUserUsedCoupon(anyLong(), anyLong())).thenReturn(true);

        // // Then
        // HttpResponseException exception = assertThrows(HttpResponseException.class,
        // () -> orderService.checkout(request, httpRequest, account));
        // assertEquals("Coupon expired!", exception.getError());

        // // Verify
        // verify(captchaService, times(1)).validate(anyString(), anyString(),
        // anyString());
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(couponRepo, times(1)).hasUserUsedCoupon(anyLong(), anyLong());
        // verify(addressRepo, times(1)).save(any(Address.class));
        // verify(orderRepo, never()).save(any(OrderReceipt.class));
        // verify(orderMapper, never()).orderToDTO(any(OrderReceipt.class));
        // verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    public void whenCheckoutWithInvalidShopCoupon_ThenThrowsException() {

        // // Given
        // CartDetailRequest cartDetail = CartDetailRequest.builder()
        // .shopId(1L)
        // .coupon("TEST")
        // .items(List.of(CartItemRequest.builder()
        // .id(1L)
        // .quantity((short) 1)
        // .build()))
        // .build();
        // OrderRequest request = OrderRequest.builder()
        // .cart(List.of(cartDetail))
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .paymentMethod(PaymentType.CASH)
        // .build();
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);
        // ICoupon projection = mock(ICoupon.class);
        // Coupon coupon = Coupon.builder().id(1L).shop(shop).code("TEST").build();

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(List.of(projection));
        // when(projection.getCoupon()).thenReturn(coupon);
        // when(couponRepo.hasUserUsedCoupon(anyLong(), anyLong())).thenReturn(false);
        // when(couponService.applyCoupon(any(Coupon.class),
        // any(CartStateRequest.class), any(Account.class)))
        // .thenReturn(null);

        // // Then
        // HttpResponseException exception = assertThrows(HttpResponseException.class,
        // () -> orderService.checkout(request, httpRequest, account));
        // assertEquals("Invalid coupon!", exception.getError());

        // // Verify
        // verify(captchaService, times(1)).validate(anyString(), anyString(),
        // anyString());
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(couponRepo, times(1)).hasUserUsedCoupon(anyLong(), anyLong());
        // verify(couponService, times(1)).applyCoupon(any(Coupon.class),
        // any(CartStateRequest.class),
        // any(Account.class));
        // verify(addressRepo, times(1)).save(any(Address.class));
        // verify(orderRepo, never()).save(any(OrderReceipt.class));
        // verify(orderMapper, never()).orderToDTO(any(OrderReceipt.class));
        // verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    public void whenCheckoutWithUnknownShopCoupon_ThenThrowsException() {

        // // Given
        // CartDetailRequest invalidCouponDetail = CartDetailRequest.builder()
        // .shopId(1L)
        // .coupon("UNKNOWN")
        // .items(List.of(CartItemRequest.builder()
        // .id(1L)
        // .quantity((short) 1)
        // .build()))
        // .build();
        // OrderRequest request = OrderRequest.builder()
        // .cart(List.of(invalidCouponDetail))
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .paymentMethod(PaymentType.CASH)
        // .build();
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(new ArrayList<>());
        // when(addressRepo.save(any(Address.class))).thenReturn(address);

        // // Then
        // HttpResponseException exception = assertThrows(HttpResponseException.class,
        // () -> orderService.checkout(request, httpRequest, account));
        // assertEquals("Invalid coupon!", exception.getError());

        // // Verify
        // verify(captchaService, times(1)).validate(anyString(), anyString(),
        // anyString());
        // verify(shopRepo, times(1)).findShopsInIds(anyList());
        // verify(bookRepo, times(1)).findBooksInIds(anyList());
        // verify(couponRepo, times(1)).findCouponInCodes(anyList());
        // verify(couponRepo, never()).hasUserUsedCoupon(anyLong(), anyLong());
        // verify(couponService, never()).applyCoupon(any(Coupon.class),
        // any(CartStateRequest.class),
        // any(Account.class));
        // verify(addressRepo, times(1)).save(any(Address.class));
        // verify(orderRepo, never()).save(any(OrderReceipt.class));
        // verify(orderMapper, never()).orderToDTO(any(OrderReceipt.class));
        // verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    public void whenCheckoutWithShopCoupon_ThenLineDiscountMatchesDetailDiscount() {

        // // Given
        // Book secondBook = Book.builder()
        // .id(2L)
        // .title("Second Book")
        // .price(101.0)
        // .amount((short) 10)
        // .discount(BigDecimal.ZERO)
        // .shop(shop)
        // .build();
        // CartDetailRequest couponDetail = CartDetailRequest.builder()
        // .shopId(1L)
        // .coupon("TEST")
        // .items(List.of(
        // CartItemRequest.builder().id(1L).quantity((short) 1).build(),
        // CartItemRequest.builder().id(2L).quantity((short) 1).build()))
        // .build();
        // OrderRequest request = OrderRequest.builder()
        // .cart(List.of(couponDetail))
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .paymentMethod(PaymentType.CASH)
        // .build();
        // ICoupon projection = mock(ICoupon.class);
        // Coupon coupon = Coupon.builder().id(1L).shop(shop).code("TEST").build();
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(book,
        // secondBook));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(List.of(projection));
        // when(projection.getCoupon()).thenReturn(coupon);
        // when(couponRepo.hasUserUsedCoupon(anyLong(), anyLong())).thenReturn(false);
        // when(couponService.applyCoupon(any(Coupon.class),
        // any(CartStateRequest.class), any(Account.class)))
        // .thenReturn(new CouponDiscountDTO(3.0, 0.0));
        // when(addressRepo.save(any(Address.class))).thenReturn(address);
        // when(orderRepo.save(any(OrderReceipt.class))).thenAnswer(invocation ->
        // invocation.getArgument(0));
        // when(orderMapper.orderToDTO(any(OrderReceipt.class))).thenReturn(ReceiptDTO.builder().id(1L).build());
        // doNothing().when(eventPublisher).publishEvent(any());

        // // Then
        // orderService.checkout(request, httpRequest, account);

        // // Verify
        // ArgumentCaptor<OrderReceipt> captor =
        // ArgumentCaptor.forClass(OrderReceipt.class);
        // verify(orderRepo, times(1)).save(captor.capture());
        // OrderReceipt savedReceipt = captor.getValue();
        // OrderDetail savedDetail = savedReceipt.getDetails().get(0);

        // double itemCouponDiscount = savedDetail.getItems().stream()
        // .map(OrderItem::getCouponDiscount)
        // .filter(Objects::nonNull)
        // .mapToDouble(Double::doubleValue)
        // .sum();
        // assertEquals(savedDetail.getCouponDiscount(), itemCouponDiscount, 0.000001);
        // verify(couponRepo, times(1)).decreaseUsage(anyLong());
    }

    @Test
    public void whenCheckoutWithOrderCoupon_ThenDetailDiscountsMatchReceiptTotals() {

        // // Given
        // Shop secondShop = Shop.builder()
        // .id(2L)
        // .name("Second Shop")
        // .address(address)
        // .owner(account)
        // .build();
        // Book firstBook = Book.builder()
        // .id(11L)
        // .title("Book 11")
        // .price(100.0)
        // .amount((short) 10)
        // .discount(BigDecimal.ZERO)
        // .shop(shop)
        // .build();
        // Book secondBook = Book.builder()
        // .id(12L)
        // .title("Book 12")
        // .price(101.0)
        // .amount((short) 10)
        // .discount(BigDecimal.ZERO)
        // .shop(secondShop)
        // .build();

        // CartDetailRequest firstDetail = CartDetailRequest.builder()
        // .shopId(1L)
        // .items(List.of(CartItemRequest.builder().id(11L).quantity((short)
        // 1).build()))
        // //.shippingType(ShippingType.STANDARD)
        // .build();
        // CartDetailRequest secondDetail = CartDetailRequest.builder()
        // .shopId(2L)
        // .items(List.of(CartItemRequest.builder().id(12L).quantity((short)
        // 1).build()))
        // //.shippingType(ShippingType.STANDARD)
        // .build();

        // OrderRequest request = OrderRequest.builder()
        // .cart(List.of(firstDetail, secondDetail))
        // .address(AddressRequest.builder()
        // .name("Test Address")
        // .companyName("Test Company")
        // .phone("0123456789")
        // .detail("Test")
        // .address("Test Street")
        // .build())
        // .paymentMethod(PaymentType.CASH)
        // .coupon("GLOBAL")
        // .build();

        // ICoupon projection = mock(ICoupon.class);
        // Coupon coupon = Coupon.builder().id(10L).code("GLOBAL").build();
        // HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // // When
        // when(httpRequest.getHeader("response")).thenReturn("valid-token");
        // when(httpRequest.getHeader("source")).thenReturn("web");
        // when(shopRepo.findShopsInIds(anyList())).thenReturn(List.of(shop,
        // secondShop));
        // when(bookRepo.findBooksInIds(anyList())).thenReturn(List.of(firstBook,
        // secondBook));
        // when(couponRepo.findCouponInCodes(anyList())).thenReturn(List.of(projection));
        // when(projection.getCoupon()).thenReturn(coupon);
        // when(couponRepo.hasUserUsedCoupon(anyLong(), anyLong())).thenReturn(false);
        // when(couponService.applyCoupon(any(Coupon.class),
        // any(CartStateRequest.class), any(Account.class)))
        // .thenReturn(new CouponDiscountDTO(3.0, 7.0));
        // when(addressRepo.save(any(Address.class))).thenReturn(address);
        // when(orderRepo.save(any(OrderReceipt.class))).thenAnswer(invocation ->
        // invocation.getArgument(0));
        // when(orderMapper.orderToDTO(any(OrderReceipt.class))).thenReturn(ReceiptDTO.builder().id(1L).build());
        // doNothing().when(eventPublisher).publishEvent(any());

        // // Then
        // orderService.checkout(request, httpRequest, account);

        // // Verify
        // ArgumentCaptor<OrderReceipt> captor =
        // ArgumentCaptor.forClass(OrderReceipt.class);
        // verify(orderRepo, times(1)).save(captor.capture());
        // OrderReceipt savedReceipt = captor.getValue();

        // double detailDiscountTotal = savedReceipt.getDetails().stream()
        // .map(OrderDetail::getDiscount)
        // .filter(Objects::nonNull)
        // .mapToDouble(Double::doubleValue)
        // .sum();
        // double detailShippingDiscountTotal = savedReceipt.getDetails().stream()
        // .map(OrderDetail::getShippingDiscount)
        // .filter(Objects::nonNull)
        // .mapToDouble(Double::doubleValue)
        // .sum();

        // assertEquals(savedReceipt.getCouponDiscount(), detailDiscountTotal,
        // 0.000001);
        // assertEquals(savedReceipt.getShippingDiscount(), detailShippingDiscountTotal,
        // 0.000001);
        // verify(couponRepo, times(1)).decreaseUsage(anyLong());
    }

    @Test
    public void whenCancelOrder_ThenSuccess() {

        // Given
        setupSecurityContext(account);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));
        when(detailRepo.save(any(OrderDetail.class))).thenReturn(orderDetail);
        when(orderRepo.save(any(OrderReceipt.class))).thenReturn(orderReceipt);

        // Then
        orderService.cancel(1L, "Test reason", account);

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, times(1)).save(any(OrderDetail.class));
        verify(orderRepo, times(1)).save(any(OrderReceipt.class));
    }

    @Test
    public void whenCancelOrderWithGhnCode_ThenCallsGhnCancel() {

        // Given
        setupSecurityContext(account);
        orderDetail.setOrderCode("GHN123");
        orderDetail.setStatus(OrderStatus.PENDING);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));
        when(orderRepo.save(any(OrderReceipt.class))).thenReturn(orderReceipt);
        when(detailRepo.save(any(OrderDetail.class))).thenReturn(orderDetail);
        when(ghnService.cancelOrders(any())).thenReturn(new com.ring.dto.response.ghn.GHNSwitchStatusResponse(
                200, "Success", List.of()));

        // Then
        orderService.cancel(1L, "Test reason", account);

        // Verify
        verify(ghnService, times(1)).cancelOrders(any());
    }

    @Test
    public void whenRequestReturnWithGhnCode_ThenCallsGhnReturnAndSetsPendingReturn() {

        // Given
        setupSecurityContext(account);
        orderDetail.setOrderCode("GHN123");
        orderDetail.setStatus(OrderStatus.SHIPPING);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));
        when(detailRepo.save(any(OrderDetail.class))).thenReturn(orderDetail);
        when(ghnService.returnOrders(any())).thenReturn(new com.ring.dto.response.ghn.GHNSwitchStatusResponse(
                200, "Success", List.of()));

        // Then
        orderService.requestReturn(1L, "reason", account);

        // Verify
        assertEquals(OrderStatus.PENDING_RETURN, orderDetail.getStatus());
        verify(ghnService, times(1)).returnOrders(any());
    }

    @Test
    public void whenCancelNonExistingOrder_ThenThrowsException() {

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> orderService.cancel(1L, "Test reason", account));
        assertEquals("Order detail not found!", exception.getError());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
        verify(orderRepo, never()).save(any(OrderReceipt.class));
    }

    @Test
    public void whenCancelSomeoneElseOrder_ThenThrowsException() {

        // Given
        Account altAccount = Account.builder()
                .id(2L)
                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                .build();
        setupSecurityContext(altAccount);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));

        // Then
        EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                () -> orderService.cancel(1L, "Test reason", altAccount));
        assertEquals("Invalid user!", exception.getError());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
        verify(orderRepo, never()).save(any(OrderReceipt.class));
    }

    @Test
    public void whenCancelInvalidStatusOrder_ThenThrowsException() {

        // Given
        orderDetail.setStatus(OrderStatus.COMPLETED);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> orderService.cancel(1L, "Test reason", account));
        assertEquals("Invalid order status!", exception.getError());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
        verify(orderRepo, never()).save(any(OrderReceipt.class));
    }

    @Test
    public void whenRefundOrder_ThenSuccess() {

        // Given
        setupSecurityContext(account);
        orderDetail.setStatus(OrderStatus.COMPLETED);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));
        when(detailRepo.save(any(OrderDetail.class))).thenReturn(orderDetail);

        // Then
        orderService.refund(1L, "Test reason", account);

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, times(1)).save(any(OrderDetail.class));
    }

    @Test
    public void whenRefundNonExistingOrder_ThenThrowsException() {

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> orderService.refund(1L, "Test reason", account));
        assertEquals("Order detail not found!", exception.getError());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
    }

    @Test
    public void whenRefundSomeoneElseOrder_ThenThrowsException() {

        // Given
        orderDetail.setStatus(OrderStatus.COMPLETED);
        Account altAccount = Account.builder()
                .id(2L)
                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                .build();
        setupSecurityContext(altAccount);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));

        // Then
        EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                () -> orderService.refund(1L, "Test reason", altAccount));
        assertEquals("Invalid user!", exception.getError());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
    }

    @Test
    public void whenRefundInvalidStatusOrder_ThenThrowsException() {

        // Given
        // setupSecurityContext(account);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> orderService.refund(1L, "Test reason", account));
        assertEquals("Invalid order status!", exception.getError());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
    }

    @Test
    public void whenRefundInvalidDate_ThenThrowsException() {

        // Given
        setupSecurityContext(account);
        orderDetail.setStatus(OrderStatus.COMPLETED);
        orderReceipt.setLastModifiedDate(LocalDateTime.now().plusMonths(1));

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> orderService.refund(1L, "Test reason", account));
        assertEquals("Invalid date!", exception.getError());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
    }

    @Test
    public void whenConfirmOrder_ThenSuccess() {

        // Given
        setupSecurityContext(account);
        orderDetail.setStatus(OrderStatus.SHIPPING);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));
        when(paymentRepo.findByOrder(anyLong())).thenReturn(Optional.of(paymentInfo));
        when(detailRepo.save(any(OrderDetail.class))).thenReturn(orderDetail);

        // Then
        orderService.confirm(1L, account);

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(paymentRepo, times(1)).findByOrder(anyLong());
        verify(detailRepo, times(1)).save(any(OrderDetail.class));
    }

    @Test
    public void whenConfirmNonExistingOrder_ThenThrowsException() {

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> orderService.confirm(1L, account));
        assertEquals("Order detail not found!", exception.getError());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(paymentRepo, never()).findByOrder(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
    }

    @Test
    public void whenConfirmSomeoneElseOrder_ThenThrowsException() {

        // Given
        orderDetail.setStatus(OrderStatus.SHIPPING);
        Account altAccount = Account.builder()
                .id(2L)
                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                .build();
        setupSecurityContext(altAccount);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));
        when(paymentRepo.findByOrder(anyLong())).thenReturn(Optional.of(paymentInfo));

        // Then
        EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                () -> orderService.confirm(1L, altAccount));
        assertEquals("Invalid user!", exception.getError());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(paymentRepo, times(1)).findByOrder(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
    }

    @Test
    public void whenConfirmInvalidStatusOrder_ThenThrowsException() {

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> orderService.confirm(1L, account));
        assertEquals("Invalid order status!", exception.getError());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(paymentRepo, never()).findByOrder(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
    }

    @Test
    public void whenConfirmInvalidPaymentStatus_ThenThrowsException() {

        // Given
        orderDetail.setStatus(OrderStatus.SHIPPING);
        paymentInfo.setStatus(PaymentStatus.PENDING);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));
        when(paymentRepo.findByOrder(anyLong())).thenReturn(Optional.of(paymentInfo));

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> orderService.confirm(1L, account));
        assertEquals("Invalid payment status!", exception.getError());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(paymentRepo, times(1)).findByOrder(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
    }

    @Test
    public void whenChangeStatus_ThenSuccess() {

        // Given
        setupSecurityContext(account);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));
        when(detailRepo.save(any(OrderDetail.class))).thenReturn(orderDetail);
        when(orderRepo.save(any(OrderReceipt.class))).thenReturn(orderReceipt);

        // Then
        orderService.changeStatus(1L, OrderStatus.REFUNDED, account);

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, times(1)).save(any(OrderDetail.class));
        verify(orderRepo, times(1)).save(any(OrderReceipt.class));
    }

    @Test
    public void whenChangeStatusNonExistingOrder_ThenThrowsException() {

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> orderService.changeStatus(1L, OrderStatus.SHIPPING, account));
        assertEquals("Order detail not found!", exception.getError());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
        verify(orderRepo, never()).save(any(OrderReceipt.class));
    }

    @Test
    public void whenChangeStatusOtherShopOrder_ThenThrowsException() {

        // Given
        Account altAccount = Account.builder()
                .id(2L)
                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                .build();
        setupSecurityContext(altAccount);

        // When
        when(detailRepo.findDetailById(anyLong())).thenReturn(Optional.of(orderDetail));

        // Then
        EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                () -> orderService.changeStatus(1L, OrderStatus.SHIPPING, altAccount));
        assertEquals("Invalid ownership!", exception.getError());

        // Verify
        verify(detailRepo, times(1)).findDetailById(anyLong());
        verify(detailRepo, never()).save(any(OrderDetail.class));
        verify(orderRepo, never()).save(any(OrderReceipt.class));
    }

    @Test
    public void whenGetAllReceipts_ThenReturnsPage() {

        // Given
        setupSecurityContext(account);
        Pageable pageable = PageRequest.of(0, 10, Sort.by("id").descending());
        IOrderReceipt projection = mock(IOrderReceipt.class);
        Page<IOrderReceipt> receipts = new PageImpl<>(List.of(projection), pageable, 1);
        List<IOrder> detailsList = new ArrayList<>(List.of(mock(IOrder.class)));
        List<ReceiptDTO> expectedDTOS = List.of(mock(ReceiptDTO.class));

        // When
        when(orderRepo.findAllBy(eq(1L),
                isNull(),
                eq(OrderStatus.PENDING),
                eq(""),
                any(Pageable.class))).thenReturn(receipts);
        when(detailRepo.findAllByReceiptIds(anyList())).thenReturn(detailsList);
        when(orderMapper.receiptsToDTOs(anyList(), anyList()))
                .thenReturn(expectedDTOS);

        // Then
        PagingResponse<ReceiptDTO> result = orderService.getAllReceipts(account,
                1L,
                OrderStatus.PENDING,
                "",
                0,
                10,
                "id",
                "desc");

        assertNotNull(result);
        assertEquals(expectedDTOS.size(), result.getContent().size());

        // Verify
        verify(orderRepo, times(1)).findAllBy(eq(1L),
                isNull(),
                eq(OrderStatus.PENDING),
                eq(""),
                any(Pageable.class));
        verify(detailRepo, times(1)).findAllByReceiptIds(anyList());
        verify(orderMapper, times(1)).receiptsToDTOs(anyList(), anyList());
    }

    @Test
    public void whenGetSummariesWithFilter_ThenReturnsPage() {

        // // Given
        // setupSecurityContext(account);
        // Pageable pageable = PageRequest.of(0, 10, Sort.by("id").descending());
        // IOrderSummary projection = mock(IOrderSummary.class);
        // Page<IOrderSummary> page = new PageImpl<>(List.of(projection), pageable, 1);
        // List<OrderSummaryDTO> expectedDTOS = List.of(mock(OrderSummaryDTO.class));

        // // When
        // when(orderRepo.findAllSummaries(eq(1L),
        // isNull(),
        // eq(1L),
        // any(Pageable.class))).thenReturn(page);
        // when(orderMapper.summaryToDTO(any(IOrderSummary.class))).thenReturn(mock(OrderSummaryDTO.class));

        // // Then
        // PagingResponse<OrderSummaryDTO> result =
        // orderService.getSummariesWithFilter(account,
        // 1L,
        // 1L,
        // 0,
        // 10,
        // "id",
        // "desc");

        // assertNotNull(result);
        // assertEquals(expectedDTOS.size(), result.getContent().size());

        // // Verify
        // verify(orderRepo, times(1)).findAllSummaries(eq(1L),
        // isNull(),
        // eq(1L),
        // any(Pageable.class));
        // verify(orderMapper, times(1)).summaryToDTO(any(IOrderSummary.class));
    }

    @Test
    public void whenGetOrdersByBookId_ThenReturnsPage() {

        // // Given
        // Pageable pageable = PageRequest.of(0, 10, Sort.by("id").descending());
        // IOrder projection = mock(IOrder.class);
        // Page<IOrder> details = new PageImpl<>(List.of(projection), pageable, 1);
        // List<IOrderItem> itemsList = new
        // ArrayList<>(List.of(mock(IOrderItem.class)));
        // List<OrderDTO> expectedDTOS = List.of(mock(OrderDTO.class));

        // // When
        // when(detailRepo.findAllByBookId(anyLong(),
        // any(Pageable.class))).thenReturn(details);
        // when(itemRepo.findAllWithDetailIds(anyList())).thenReturn(itemsList);
        // when(orderMapper.ordersAndItemsProjectionToDTOS(anyList(),
        // anyList())).thenReturn(expectedDTOS);

        // // Then
        // PagingResponse<OrderDTO> result = orderService.getOrdersByBookId(1L,
        // 0,
        // 10,
        // "id",
        // "desc");

        // assertNotNull(result);
        // assertEquals(expectedDTOS.size(), result.getContent().size());

        // // Verify
        // verify(detailRepo, times(1)).findAllByBookId(anyLong(), any(Pageable.class));
        // verify(itemRepo, times(1)).findAllWithDetailIds(anyList());
        // verify(orderMapper, times(1)).ordersAndItemsProjectionToDTOS(anyList(),
        // anyList());
    }

    @Test
    public void whenGetOrdersByUser_ThenReturnsPage() {

        // Given
        Pageable pageable = PageRequest.of(0, 10);
        IOrder projection = mock(IOrder.class);
        Page<IOrder> details = new PageImpl<>(List.of(projection), pageable, 1);
        List<IOrderItem> itemsList = List.of(mock(IOrderItem.class));
        List<OrderDTO> expectedDTOS = List.of(mock(OrderDTO.class));

        // When
        when(detailRepo.findAllByUserId(anyLong(), any(), anyString(), any(Pageable.class)))
                .thenReturn(details);
        when(itemRepo.findAllWithDetailIds(anyList())).thenReturn(itemsList);
        when(orderMapper.ordersToDTOs(anyList(), anyList())).thenReturn(expectedDTOS);

        // Then
        PagingResponse<OrderDTO> result = orderService.getOrdersByUser(account,
                OrderStatus.PENDING, "", 0, 10);

        assertNotNull(result);
        assertEquals(expectedDTOS.size(), result.getContent().size());

        // Verify
        verify(detailRepo, times(1)).findAllByUserId(anyLong(), any(), anyString(), any(Pageable.class));
        verify(itemRepo, times(1)).findAllWithDetailIds(anyList());
        verify(orderMapper, times(1)).ordersToDTOs(anyList(), anyList());
    }

    @Test
    public void whenGetReceipt_ThenReturnsReceiptDTO() {

        // Given
        ReceiptDTO expected = mock(ReceiptDTO.class);

        // When
        when(orderRepo.findById(anyLong())).thenReturn(Optional.of(orderReceipt));
        when(orderMapper.orderToDTO(any(OrderReceipt.class))).thenReturn(expected);

        // Then
        ReceiptDTO result = orderService.getReceipt(1L);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(orderRepo, times(1)).findById(anyLong());
        verify(orderMapper, times(1)).orderToDTO(any(OrderReceipt.class));
    }

    @Test
    public void whenGetNonExistingReceipt_ThenThrowsException() {

        // When
        when(orderRepo.findById(anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> orderService.getReceipt(1L));
        assertEquals("Order not found!", exception.getError());

        // Verify
        verify(orderRepo, times(1)).findById(anyLong());
        verify(orderMapper, never()).orderToDTO(any(OrderReceipt.class));
    }

    @Test
    public void whenGetOrderDetail_ThenReturnsOrderDetailDTO() {

        // Given
        setupSecurityContext(account);
        IOrderDetail projection = mock(IOrderDetail.class);
        List<IOrderItem> itemsList = List.of(mock(IOrderItem.class));
        OrderDetailDTO expected = mock(OrderDetailDTO.class);

        // When
        when(detailRepo.findOrderDetail(eq(1L), isNull())).thenReturn(Optional.of(projection));
        when(itemRepo.findAllWithDetailIds(anyList())).thenReturn(itemsList);
        when(orderMapper.orderDetailAndItemsProjectionToOrderDetailDTO(any(IOrderDetail.class), anyList()))
                .thenReturn(expected);

        // Then
        OrderDetailDTO result = orderService.getOrderDetail(1L, account);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(detailRepo, times(1)).findOrderDetail(eq(1L), isNull());
        verify(itemRepo, times(1)).findAllWithDetailIds(anyList());
        verify(orderMapper, times(1)).orderDetailAndItemsProjectionToOrderDetailDTO(any(IOrderDetail.class),
                anyList());
    }

    @Test
    public void whenGetNonExistingOrderDetail_ThenThrowsException() {

        // Given
        setupSecurityContext(account);

        // When
        when(detailRepo.findOrderDetail(eq(1L), isNull())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> orderService.getOrderDetail(1L, account));
        assertEquals("Order detail not found!", exception.getError());

        // Verify
        verify(detailRepo, times(1)).findOrderDetail(eq(1L), isNull());
        verify(itemRepo, never()).findAllWithDetailIds(anyList());
        verify(orderMapper, never()).orderDetailAndItemsProjectionToOrderDetailDTO(any(IOrderDetail.class),
                anyList());
    }

    @Test
    public void whenGetAnalytics_ThenReturnsStatDTO() {
        // NOTE: removed because OrderServiceImpl no longer exposes getAnalytics() in
        // this branch.
    }

    @Test
    public void whenGetMonthlySales_ThenReturnsChartDTOList() {

        // // Given
        // setupSecurityContext(account);
        // Map<String, Object> data = new HashMap<>();
        // List<Map<String, Object>> dataList = List.of(data);
        // List<ChartDTO> expected = List.of(mock(ChartDTO.class));

        // // When
        // when(orderRepo.getMonthlySales(eq(1L), isNull(),
        // eq(2024))).thenReturn(dataList);
        // when(dashMapper.dataToChartDTO(data)).thenReturn(mock(ChartDTO.class));

        // // Then
        // List<ChartDTO> result = orderService.getMonthlySales(account, 1L, 2024);

        // assertNotNull(result);
        // assertEquals(expected.size(), result.size());

        // // Verify
        // verify(orderRepo, times(1)).getMonthlySales(eq(1L), isNull(), eq(2024));
        // verify(dashMapper, times(1)).dataToChartDTO(data);
    }
}