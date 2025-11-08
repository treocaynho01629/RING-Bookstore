package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.common.CommonUtils;
import com.ring.dto.projection.coupons.ICoupon;
import com.ring.dto.projection.orders.*;
import com.ring.dto.request.*;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.coupons.CouponDiscountDTO;
import com.ring.dto.response.dashboard.ChartDTO;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.dto.response.orders.*;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.HttpResponseException;
import com.ring.exception.PaymentException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.listener.events.OnCheckoutCompletedEvent;
import com.ring.mapper.CalculateMapper;
import com.ring.mapper.CouponMapper;
import com.ring.mapper.DashboardMapper;
import com.ring.mapper.OrderMapper;
import com.ring.model.entity.*;
import com.ring.model.enums.*;
import com.ring.repository.*;
import com.ring.service.CaptchaService;
import com.ring.service.CouponService;
import com.ring.service.OrderService;
import com.ring.service.PayOSService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentLinkData;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service class for managing orders.
 */
@RequiredArgsConstructor
@Service
public class OrderServiceImpl implements OrderService {

    private final OrderReceiptRepository orderRepo;
    private final OrderDetailRepository detailRepo;
    private final OrderItemRepository itemRepo;
    private final BookRepository bookRepo;
    private final ShopRepository shopRepo;
    private final CouponRepository couponRepo;
    private final AddressRepository addressRepo;
    private final PaymentInfoRepository paymentRepo;

    private final CouponService couponService;
    private final CaptchaService captchaService;
    private final PayOSService payOSService;
    private final MessageService messageSerice;

    private final OrderMapper orderMapper;
    private final CalculateMapper calculateMapper;
    private final DashboardMapper dashMapper;
    private final CouponMapper couponMapper;

    private final ApplicationEventPublisher eventPublisher;

    @Cacheable(cacheNames = AppConstants.CALCULATE)
    public CalculateDTO calculate(CalculateRequest request, Account user) {

        // Create address
        AddressRequest addressRequest = request.getAddress();
        var address = addressRequest != null
                ? Address.builder()
                        .name(addressRequest.getName())
                        .companyName(addressRequest.getCompanyName())
                        .phone(addressRequest.getPhone())
                        .city(addressRequest.getCity())
                        .address(addressRequest.getAddress())
                        .type(addressRequest.getType())
                        .build()
                : null;

        OrderReceipt calculatedReceipt = processOrder(request.getCart(),
                request.getCoupon(),
                address,
                null,
                user,
                false);

        return calculateMapper.orderToDTO(calculatedReceipt);
    }

    @CacheEvict(cacheNames = { AppConstants.CALCULATE, AppConstants.RECEIPTS, 
        AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS, AppConstants.SALES }, allEntries = true)
    @Transactional
    public ReceiptDTO checkout(OrderRequest checkRequest,
            HttpServletRequest request,
            Account user) {

        // Recaptcha
        final String recaptchaToken = request.getHeader(AppConstants.HEADER_RESPONSE);
        final String source = request.getHeader(AppConstants.HEADER_RECAPTCHA_SOURCE);
        captchaService.validate(recaptchaToken, source, CaptchaServiceImpl.CHECKOUT_ACTION);

        // Create address
        AddressRequest addressRequest = checkRequest.getAddress();
        var address = Address.builder()
                .name(addressRequest.getName())
                .companyName(addressRequest.getCompanyName())
                .phone(addressRequest.getPhone())
                .city(addressRequest.getCity())
                .address(addressRequest.getAddress())
                .type(addressRequest.getType())
                .build();
        Address savedAddress = addressRepo.save(address);

        OrderReceipt orderReceipt = processOrder(checkRequest.getCart(),
                checkRequest.getCoupon(),
                savedAddress,
                checkRequest.getPaymentMethod(),
                user,
                true);

        // Payment
        PaymentInfo paymentInfo = PaymentInfo.builder()
                .paymentType(checkRequest.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .amount((int) Math.floor(orderReceipt.getTotal() - orderReceipt.getTotalDiscount()))
                .build();

        // Set relevant values
        orderReceipt.setUser(user);
        orderReceipt.setEmail(user.getEmail());
        orderReceipt.setAddress(savedAddress);

        orderReceipt.setPayment(paymentInfo);
        orderRepo.save(orderReceipt);

        ReceiptDTO receiptDTO = orderMapper.orderToDTO(orderReceipt);

        if (checkRequest.getPaymentMethod().equals(PaymentType.ONLINE_PAYMENT)) {
            try {
                CheckoutResponseData checkoutResponse = payOSService.checkout(receiptDTO);

                paymentInfo.setCheckoutUrl(checkoutResponse.getCheckoutUrl());
                paymentInfo.setStatus(PaymentStatus.valueOf(checkoutResponse.getStatus()));
                paymentInfo.setAmount(checkoutResponse.getAmount());
                paymentInfo.setDescription(checkoutResponse.getDescription());
                paymentInfo.setExpiredAt(Instant.ofEpochSecond(checkoutResponse.getExpiredAt())
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime());

                orderRepo.save(orderReceipt);
            } catch (PaymentException ignored) {
            }
        }

        // Trigger email event
        eventPublisher.publishEvent(new OnCheckoutCompletedEvent(
                user.getUsername(),
                user.getEmail(),
                orderReceipt.getProductsPrice(),
                orderReceipt.getShippingFee(),
                receiptDTO));

        return receiptDTO;
    }

    @Cacheable(cacheNames = AppConstants.PAYMENT_LINK, key = "#id")
    @Transactional
    public PaymentInfo createPaymentLink(HttpServletRequest request,
            Long id) {

        // Recaptcha
        final String recaptchaToken = request.getHeader(AppConstants.HEADER_RESPONSE);
        final String source = request.getHeader(AppConstants.HEADER_RECAPTCHA_SOURCE);
        captchaService.validate(recaptchaToken, source, CaptchaServiceImpl.PAYMENT_ACTION);

        PaymentInfo paymentInfo = paymentRepo.findByOrder(id)
            .orElseThrow(() -> {
                var errorMsg = messageSerice.getMessage("exception.not.found",
                    new Object[]{ new DefaultMessageSourceResolvable("label.order.payment") });
                return new ResourceNotFoundException(errorMsg);
            });

        if (paymentInfo.getPaymentType().equals(PaymentType.ONLINE_PAYMENT)
                && paymentInfo.getStatus().equals(PaymentStatus.PENDING)
                && paymentInfo.getCheckoutUrl() == null) {
            ReceiptDTO receiptDTO = this.getReceipt(id);
            CheckoutResponseData checkoutResponse = payOSService.checkout(receiptDTO);

            LocalDateTime expiredAt = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(checkoutResponse.getExpiredAt()),
                    ZoneId.systemDefault());

            paymentInfo.setCheckoutUrl(checkoutResponse.getCheckoutUrl());
            paymentInfo.setStatus(PaymentStatus.valueOf(checkoutResponse.getStatus()));
            paymentInfo.setAmount(checkoutResponse.getAmount());
            paymentInfo.setDescription(checkoutResponse.getDescription());
            paymentInfo.setExpiredAt(expiredAt);

            paymentRepo.save(paymentInfo);
        }

        return paymentInfo;
    }

    @Cacheable(cacheNames = "payment", key = "#id")
    public PaymentLinkData getPaymentLinkData(Long id) {
        return payOSService.getPaymentLinkData(id);
    }

    @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS }, allEntries = true)
    @Transactional
    public void cancel(Long id, String reason, Account user) {

        OrderDetail detail = detailRepo.findDetailById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check valid status for cancel
        OrderStatus currStatus = detail.getStatus();
        if (!OrderStatus.PENDING.equals(currStatus)) {

            var errorMsg = messageSerice.getMessage("exception.invalid",
                new Object[]{ new DefaultMessageSourceResolvable("label.order.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST, 
                AppConstants.INVALID_ARGUMENT,
                errorMsg);
        }

        // Check if correct user
        OrderReceipt order = detail.getOrder();
        if (!isValidBuyer(order, user)) {

            var errorMsg = messageSerice.getMessage("exception.ownership",
                new Object[]{ new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        detail.setStatus(OrderStatus.CANCELED);
        detail.setNote(reason);
        detailRepo.save(detail);

        // Subtract price & discount
        order.setTotal(order.getTotal() - detail.getTotalPrice() - detail.getShippingFee());
        order.setTotalDiscount(order.getTotalDiscount() - detail.getDiscount() - detail.getShippingDiscount());

        orderRepo.save(order);
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS, 
                AppConstants.RECEIPTS, AppConstants.SALES }, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.PAYMENT_LINK, key = "#orderId"),
            @CacheEvict(cacheNames = AppConstants.PAYMENT, key = "#orderId") })
    @Transactional
    public void cancelUnpaidOrder(Long orderId, String reason, Account user) {

        OrderReceipt order = orderRepo.findById(orderId)
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if correct user
        if (!isValidBuyer(order, user)) {
            var errorMsg = messageSerice.getMessage("exception.ownership",
                new Object[]{ new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        PaymentInfo paymentInfo = paymentRepo.findByOrder(order.getId())
            .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order.payment") });
                    return new ResourceNotFoundException(errorMsg);
                });

        if (!PaymentStatus.PENDING.equals(paymentInfo.getStatus())) {

            var errorMsg = messageSerice.getMessage("exception.invalid",
                new Object[]{ new DefaultMessageSourceResolvable("label.order.payment.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST, 
                AppConstants.INVALID_ARGUMENT,
                errorMsg);
        }

        // Cancel all details
        detailRepo.cancelUnpaidByOrderId(order.getId(), reason);

        // Subtract price & discount
        order.setTotal(0.0);
        order.setTotalDiscount(0.0);

        if (paymentInfo.getPaymentType().equals(PaymentType.ONLINE_PAYMENT)) {
            // Cancel payment
            try {
                PaymentLinkData paymentData = payOSService.cancel(order.getId(), reason);
                paymentInfo.setExpiredAt(null);
                paymentInfo.setStatus(PaymentStatus.valueOf(paymentData.getStatus()));
            } catch (Exception ignored) {
                paymentInfo.setStatus(PaymentStatus.CANCELED);
            }
        } else {
            paymentInfo.setStatus(PaymentStatus.CANCELED);
        }

        paymentRepo.save(paymentInfo);
        orderRepo.save(order);
    }

    @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS, 
        AppConstants.RECEIPTS, AppConstants.SALES }, allEntries = true)
    @Transactional
    public void refund(Long id,
            String reason,
            Account user) {

        OrderDetail detail = detailRepo.findDetailById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check valid status for cancel
        OrderStatus currStatus = detail.getStatus();
        if (!OrderStatus.COMPLETED.equals(currStatus)) {

            var errorMsg = messageSerice.getMessage("exception.invalid",
                new Object[]{ new DefaultMessageSourceResolvable("label.order.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST, 
                AppConstants.INVALID_ARGUMENT,
                errorMsg);
        }

        // Check if correct user
        OrderReceipt order = detail.getOrder();
        if (!isValidBuyer(order, user)) {

            var errorMsg = messageSerice.getMessage("exception.ownership",
                new Object[]{ new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        if (order.getLastModifiedDate()
                .plus(1, ChronoUnit.WEEKS)
                .isAfter(LocalDateTime.now())) {
            var errorMsg = messageSerice.getMessage("exception.date.invalid",
                new Object[]{ new DefaultMessageSourceResolvable("label.order") });
            throw new HttpResponseException(HttpStatus.CONFLICT, 
                AppConstants.INVALID_DATE,
                errorMsg);
        }

        detail.setStatus(OrderStatus.PENDING_REFUND);
        detail.setNote(reason);
        detailRepo.save(detail);
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS, 
                AppConstants.RECEIPTS, AppConstants.SALES }, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.PAYMENT_LINK, key = "#orderId"),
            @CacheEvict(cacheNames = AppConstants.PAYMENT, key = "#orderId") })
    @Transactional
    public void changePaymentMethod(Long orderId,
            PaymentType paymentMethod,
            Account user) {

        OrderReceipt order = orderRepo.findById(orderId)
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if correct user
        if (!isValidBuyer(order, user)) {
            var errorMsg = messageSerice.getMessage("exception.ownership",
                new Object[]{ new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        PaymentInfo paymentInfo = paymentRepo.findByOrder(order.getId())
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order.payment") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check valid status for cancel
        if (!PaymentStatus.PENDING.equals(paymentInfo.getStatus())) {
            var errorMsg = messageSerice.getMessage("exception.invalid",
                new Object[]{ new DefaultMessageSourceResolvable("label.order.payment.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST, 
                AppConstants.INVALID_ARGUMENT,
                errorMsg);
        }
        
        paymentInfo.setPaymentType(paymentMethod);
        paymentRepo.save(paymentInfo);
    }

    @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS, 
        AppConstants.RECEIPTS, AppConstants.SALES }, allEntries = true)
    @Transactional
    public void confirm(Long id,
            Account user) {

        OrderDetail detail = detailRepo.findDetailById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check valid status for cancel
        OrderStatus currStatus = detail.getStatus();
        if (!OrderStatus.SHIPPING.equals(currStatus)) {
            var errorMsg = messageSerice.getMessage("exception.invalid",
                new Object[]{ new DefaultMessageSourceResolvable("label.order.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST, 
                AppConstants.INVALID_ARGUMENT,
                errorMsg);
        }

        PaymentInfo paymentInfo = paymentRepo.findByOrder(detail.getOrder().getId())
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order.payment") });
                    return new ResourceNotFoundException(errorMsg);
                });

        if (!PaymentStatus.PAID.equals(paymentInfo.getStatus())) {
            var errorMsg = messageSerice.getMessage("exception.invalid",
                new Object[]{ new DefaultMessageSourceResolvable("label.order.payment.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST, 
                AppConstants.INVALID_ARGUMENT,
                errorMsg);
        }

        // Check if correct user
        if (!isValidBuyer(detail.getOrder(), user)) {
            var errorMsg = messageSerice.getMessage("exception.ownership",
                new Object[]{ new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        detail.setStatus(OrderStatus.COMPLETED);
        detailRepo.save(detail);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS, 
                AppConstants.RECEIPTS, AppConstants.SALES }, allEntries = true),
        @CacheEvict(cacheNames = AppConstants.PAYMENT_LINK, key = "#id"),
        @CacheEvict(cacheNames = AppConstants.PAYMENT, key = "#id") })
    @Transactional
    public void confirmPayment(Long id) {

        // Update payment status
        PaymentInfo paymentInfo = paymentRepo.findByOrder(id).orElse(null);

        if (paymentInfo != null) {
            paymentInfo.setStatus(PaymentStatus.PAID);
            paymentRepo.save(paymentInfo);
        }

        // Update details status
        detailRepo.confirmPaymentByOrderId(id);
    }

    @Caching(evict = {
        @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS, 
                AppConstants.RECEIPTS, AppConstants.SALES }, allEntries = true),
        @CacheEvict(cacheNames = AppConstants.PAYMENT_LINK, key = "#id"),
        @CacheEvict(cacheNames = AppConstants.PAYMENT, key = "#id") })
    @Transactional
    public void changeStatus(Long id,
            OrderStatus status,
            Account user) {

        OrderDetail detail = detailRepo.findDetailById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });
        OrderReceipt order = detail.getOrder();

        // Check if correct user
        if (!CommonUtils.isValidShopOwner(detail.getShop(), user)) {
            var errorMsg = messageSerice.getMessage("exception.ownership",
                new Object[]{ new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        detail.setStatus(status);
        detailRepo.save(detail);

        // Subtract price & discount
        if (OrderStatus.CANCELED.equals(status) || OrderStatus.REFUNDED.equals(status)) {
            order.setTotal(order.getTotal() - detail.getTotalPrice() - detail.getShippingFee());
            order.setTotalDiscount(
                    order.getTotalDiscount() - detail.getDiscount() - detail.getShippingDiscount());
            orderRepo.save(order);
        }
    }

    @Cacheable(cacheNames = AppConstants.RECEIPTS)
    @Transactional
    public PagingResponse<ReceiptDTO> getAllReceipts(Account user,
            Long shopId,
            OrderStatus status,
            String keyword,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir) {

        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending());
        boolean isAdmin = CommonUtils.isAuthAdmin();

        Page<IOrderReceipt> receipts = orderRepo.findAllBy(shopId,
                isAdmin ? null : user.getId(),
                status,
                keyword,
                pageable); // Fetch from database
        List<Long> receiptIds = receipts.getContent().stream().map(IOrderReceipt::getId)
                .collect(Collectors.toList());
        List<IOrder> details = detailRepo.findAllByReceiptIds(receiptIds);

        // Map
        List<ReceiptDTO> ordersList = orderMapper.receiptsAndDetailsProjectionToReceiptDTOS(
                receipts.getContent(),
                details);
        return new PagingResponse<>(
                ordersList,
                receipts.getTotalPages(),
                receipts.getTotalElements(),
                receipts.getSize(),
                receipts.getNumber(),
                receipts.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.RECEIPTS)
    @Transactional
    public PagingResponse<ReceiptSummaryDTO> getSummariesWithFilter(Account user,
            Long shopId,
            Long bookId,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir) {

        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending());
        boolean isAdmin = CommonUtils.isAuthAdmin();

        Page<IReceiptSummary> summariesList = orderRepo.findAllSummaries(shopId,
                isAdmin ? null : user.getId(),
                bookId,
                pageable);

        if (summariesList == null) {
            var errorMsg = messageSerice.getMessage("exception.ownership",
                new Object[]{ new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        List<ReceiptSummaryDTO> summariesDTOS = summariesList.map(orderMapper::summaryToDTO).toList();
        return new PagingResponse<>(
                summariesDTOS,
                summariesList.getTotalPages(),
                summariesList.getTotalElements(),
                summariesList.getSize(),
                summariesList.getNumber(),
                summariesList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.ORDERS)
    @Override
    public PagingResponse<OrderDTO> getOrdersByBookId(Long id,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir) {
        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending());

        Page<IOrder> details = detailRepo.findAllByBookId(id, pageable);
        List<Long> orderIds = details.getContent().stream().map(IOrder::getId).collect(Collectors.toList());
        List<IOrderItem> items = itemRepo.findAllWithDetailIds(orderIds);
        List<OrderDTO> ordersList = orderMapper.ordersAndItemsProjectionToDTOS(details.getContent(), items);
        return new PagingResponse<>(
                ordersList,
                details.getTotalPages(),
                details.getTotalElements(),
                details.getSize(),
                details.getNumber(),
                details.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.ORDERS)
    @Transactional
    public PagingResponse<OrderDTO> getOrdersByUser(Account user,
            OrderStatus status,
            String keyword,
            Integer pageNo,
            Integer pageSize) {

        Pageable pageable = PageRequest.of(pageNo, pageSize);

        Page<IOrder> details = detailRepo.findAllByUserId(user.getId(), status, keyword, pageable);
        List<Long> orderIds = details.getContent().stream().map(IOrder::getId).collect(Collectors.toList());
        List<IOrderItem> items = itemRepo.findAllWithDetailIds(orderIds);
        List<OrderDTO> ordersList = orderMapper.ordersAndItemsProjectionToDTOS(details.getContent(), items);
        return new PagingResponse<>(
                ordersList,
                details.getTotalPages(),
                details.getTotalElements(),
                details.getSize(),
                details.getNumber(),
                details.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.RECEIPTS, key = "#id")
    public ReceiptDTO getReceipt(Long id) {

        OrderReceipt order = orderRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order") });
                    return new ResourceNotFoundException(errorMsg);
                });
        ReceiptDTO receiptDTO = orderMapper.orderToDTO(order); // Map to DTO
        return receiptDTO;
    }

    @Transactional
    public OrderDetailDTO getOrderDetail(Long id, Account user) {

        boolean isAdmin = CommonUtils.isAuthAdmin();
        IOrderDetail detailProjection = detailRepo.findOrderDetail(id, isAdmin ? null : user.getId())
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });
        List<IOrderItem> items = itemRepo.findAllWithDetailIds(List.of(detailProjection.getId()));
        OrderDetailDTO detailDTO = orderMapper.orderDetailAndItemsProjectionToOrderDetailDTO(detailProjection,
                items);
        return detailDTO;
    }

    @Transactional
    public ReceiptDetailDTO getReceiptDetail(Long id, Account user) {

        boolean isAdmin = CommonUtils.isAuthAdmin();
        IReceiptDetail receiptProjection = orderRepo.findReceiptDetail(id, isAdmin ? null : user.getId())
                .orElseThrow(() -> {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.order") });
                    return new ResourceNotFoundException(errorMsg);
                });
        List<IOrder> details = detailRepo.findAllByReceiptId(id);
        List<Long> orderIds = details.stream().map(IOrder::getId).collect(Collectors.toList());
        List<IOrderItem> items = itemRepo.findAllWithDetailIds(orderIds);
        List<OrderDTO> ordersList = orderMapper.ordersAndItemsProjectionToDTOS(details, items);
        ReceiptDetailDTO orderDTO = orderMapper.receiptDetailAndDetailsDTOToReceiptDetailDTO(receiptProjection,
                ordersList); // Map to DTO
        return orderDTO;
    }

    @Cacheable(cacheNames = AppConstants.ORDER_ANALYTICS)
    public StatDTO getAnalytics(Account user, Long shopId) {

        boolean isAdmin = CommonUtils.isAuthAdmin();
        var label = StringUtils.capitalize(messageSerice.getMessage("label.sales"));
        return dashMapper.statToDTO(detailRepo.getSalesAnalytics(shopId, isAdmin ? null : user.getId()),
                AppConstants.SALES,
                label);
    }

    @Cacheable(cacheNames = AppConstants.SALES)
    public List<ChartDTO> getMonthlySales(Account user, Long shopId, Integer year) {

        boolean isAdmin = CommonUtils.isAuthAdmin();
        List<Map<String, Object>> data = orderRepo.getMonthlySales(shopId, isAdmin ? null : user.getId(), year);
        return data.stream().map(dashMapper::dataToChartDTO).collect(Collectors.toList()); // Return chart data
    }

    /**
     * Process order from cart
     * 
     * @param cart      Cart details
     * @param orderCoupon   Order coupon code
     * @param address       Address
     * @param paymentMethod Payment method
     * @param user      Current user
     * @param isCheckout    Is processing checkout if no ignore exception
     * @return Processed order receipt
     */
    private OrderReceipt processOrder(List<CartDetailRequest> cart,
            String orderCoupon,
            Address address,
            PaymentType paymentMethod,
            Account user,
            boolean isCheckout) {

        // Create receipt
        var orderReceipt = OrderReceipt.builder()
                .details(new ArrayList<>())
                .build();

        // Get books, shops, coupons IDS for prefetch
        List<Long> bookIds = cart.stream()
                .flatMap(detail -> detail.getItems().stream().map(CartItemRequest::getId))
                .collect(Collectors.toList());
        List<Long> shopIds = cart.stream()
                .map(CartDetailRequest::getShopId)
                .collect(Collectors.toList());
        List<String> couponCodes = cart.stream()
                .map(CartDetailRequest::getCoupon)
                .collect(Collectors.toList());

        // Add base order coupon
        if (orderCoupon != null) {
            couponCodes.add(orderCoupon);
        }

        // Fetch shops, books, coupons
        Map<Long, Shop> shops = shopRepo.findShopsInIds(shopIds)
                .stream()
                .collect(Collectors.toMap(Shop::getId, Function.identity())); // Map to ID
        Map<Long, Book> books = bookRepo.findBooksInIds(bookIds)
                .stream()
                .collect(Collectors.toMap(Book::getId, Function.identity())); // Map to ID
        Map<String, ICoupon> coupons = couponRepo.findCouponInCodes(couponCodes)
                .stream()
                .collect(Collectors.toMap(coupon -> coupon.getCoupon().getCode(), Function.identity())); // Map to code

        // Initial values
        double totalPrice = 0.0; // Total price
        double totalShippingFee = 0.0; // Total shipping fee
        double totalDealDiscount = 0.0; // Total deal discount
        double totalCouponDiscount = 0.0; // Total coupon discount
        double totalShippingDiscount = 0.0; // Total shipping discount
        int totalQuantity = 0; // Total quantity

        // Process each detail in the cart order
        for (CartDetailRequest detail : cart) {
            OrderDetail orderDetail = processOrderDetail(detail,
                    shops,
                    books,
                    coupons,
                    address,
                    paymentMethod,
                    user,
                    isCheckout);

            // Add detail to order
            orderReceipt.addOrderDetail(orderDetail);

            // Add value
            totalPrice += orderDetail.getTotalPrice();
            totalQuantity += orderDetail.getTotalQuantity();
            totalShippingFee += orderDetail.getShippingFee();
            totalCouponDiscount += orderDetail.getCouponDiscount();
            totalShippingDiscount += orderDetail.getShippingDiscount();
            totalDealDiscount += orderDetail.getDealDiscount();
        }

        // Apply main coupon
        ICoupon cProjection = orderCoupon == null 
                ? null // Null => User not select any coupon
                : coupons.containsKey(orderCoupon) 
                    ? coupons.get(orderCoupon)
                    : couponRepo.recommendCoupon(null, totalPrice - totalDealDiscount, totalQuantity, user.getId()).orElse(null);

        Coupon coupon = cProjection != null ? cProjection.getCoupon() : null;
        if (coupon != null && coupon.getShop() == null
                && !couponService.isExpired(coupon)) {

            // Initial value
            double discountValue = 0.0;
            double shippingDiscount = 0.0;
            double value = totalPrice - totalDealDiscount - totalCouponDiscount;
            double shipping = totalShippingFee - totalShippingDiscount;

            // Apply coupon
            CouponDiscountDTO discountFromCoupon = null;
            if (couponRepo.hasUserUsedCoupon(coupon.getId(), user.getId())) {
                
                coupon.setIsUsed(true);
                if (isCheckout) {

                    var errorMsg = messageSerice.getMessage("exception.coupon.expired",
                        new Object[]{ orderCoupon });
                    throw new HttpResponseException(
                            HttpStatus.CONFLICT,
                            AppConstants.COUPON_EXPIRED,
                            errorMsg);
                }
            } else {

                discountFromCoupon = couponService.applyCoupon(coupon,
                        new CartStateRequest(value, 
                            shipping, 
                            totalQuantity, 
                            null),
                            user);
            }

            if (discountFromCoupon != null) {

                // Decrease usage on checkout
                if (isCheckout) couponRepo.decreaseUsage(coupon.getId());

                coupon.setIsUsable(true); // Mark usable for DTO result mapping
                
                discountValue = discountFromCoupon.discountValue();
                shippingDiscount = discountFromCoupon.discountShipping();

                // Split discount for each detail
                double discountRatio = discountValue / value;
                double shippingDiscountRatio = shippingDiscount / shipping;

                for (OrderDetail detail : orderReceipt.getDetails()) {
                    double pDiscount = detail.getDiscount() != null ? detail.getDiscount() : 0;
                    double sDiscount = detail.getShippingDiscount() != null
                            ? detail.getShippingDiscount()
                            : 0;
                    double applyDiscount = (detail.getTotalPrice() - pDiscount) * discountRatio;
                    double applyShippingDiscount = (detail.getShippingFee() - sDiscount)
                            * shippingDiscountRatio;

                    detail.setDiscount(pDiscount + applyDiscount);
                    detail.setShippingDiscount(sDiscount + applyShippingDiscount);
                }
            } else if (isCheckout) {
                var errorMsg = messageSerice.getMessage("exception.coupon.invalid",
                        new Object[]{ orderCoupon });
                throw new HttpResponseException(
                        HttpStatus.CONFLICT,
                        AppConstants.INVALID_COUPON,
                        errorMsg);
            }

            // Add to total
            totalCouponDiscount += discountValue;
            totalShippingDiscount += shippingDiscount;
        }

        // Total discount
        double totalDiscount = totalCouponDiscount + totalDealDiscount + totalShippingDiscount;

        // Set value
        orderReceipt.setTotal(totalPrice + totalShippingFee);
        orderReceipt.setProductsPrice(totalPrice);
        orderReceipt.setShippingFee(totalShippingFee);
        orderReceipt.setTotalDiscount(totalDiscount);
        orderReceipt.setDealDiscount(totalDealDiscount);
        orderReceipt.setCouponDiscount(totalCouponDiscount);
        orderReceipt.setShippingDiscount(totalShippingDiscount);

        if (isCheckout) {
            orderReceipt.setCoupon(coupon);
        } else {
            orderReceipt.setCouponDTO(cProjection != null ? couponMapper.couponToDTO(cProjection) : null);
        }

        return orderReceipt;
    }

    /**
     * Process detail (Shop's items)
     * 
     * @param detail    Detail request
     * @param shops     Shops
     * @param books     Books
     * @param coupons       Coupons
     * @param address       Address
     * @param paymentMethod Payment method
     * @param user      Current user
     * @param isCheckout    Is processing checkout if no ignore exception
     * @return Processed detail
     */
    private OrderDetail processOrderDetail(CartDetailRequest detail,
            Map<Long, Shop> shops,
            Map<Long, Book> books,
            Map<String, ICoupon> coupons,
            Address address,
            PaymentType paymentMethod,
            Account user,
            boolean isCheckout) {

        // Shop validation
        Shop shop = shops.get(detail.getShopId());
        List<CartItemRequest> items = detail.getItems();
        if (shop == null || items == null || items.isEmpty()) {
            if (isCheckout) {
                var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.shop") });
                throw new ResourceNotFoundException(errorMsg);
            }

            // Return temp detail
            return OrderDetail.builder()
                    .shop(Shop.builder().id(detail.getShopId()).build())
                    .totalPrice(0.0)
                    .shippingFee(0.0)
                    .discount(0.0)
                    .shippingDiscount(0.0)
                    .coupon(Coupon.builder().code(detail.getCoupon()).build())
                    .items(new ArrayList<>()).build();
        }

        // New detail
        // Set status depends on payment
        OrderStatus status = paymentMethod == PaymentType.CASH
                ? OrderStatus.PENDING
                : OrderStatus.PENDING_PAYMENT;
        OrderDetail orderDetail = OrderDetail.builder()
                .status(status)
                .shop(shop)
                .items(new ArrayList<>()).build();

        // Initial value
        double shippingFee = calculateShippingFee(shop.getAddress(), address, detail.getShippingType());
        double detailTotal = 0.0;
        double discountDeal = 0.0;
        double discountCoupon = 0.0;
        double discountValue = 0.0;
        double discountShipping = 0.0;
        int detailQuantity = 0;

        // Process each item in detail
        for (CartItemRequest item : items) {

            // Book validation
            Book book = books.get(item.getId());
            if (book == null || !book.getShop().getId().equals(shop.getId())) {

                if (isCheckout) {
                    var errorMsg = messageSerice.getMessage("exception.not.found",
                        new Object[]{ new DefaultMessageSourceResolvable("label.product") });
                    throw new ResourceNotFoundException(errorMsg);
                }

                // Create temp item
                var orderItem = OrderItem.builder()
                        .book(Book.builder().id(item.getId()).build())
                        .build();

                orderDetail.addOrderItem(orderItem);
                continue; // Skip other steps
            }

            // Stocks validation
            short quantity = item.getQuantity();
            if (quantity < 1 || quantity > book.getAmount()) {

                throw new HttpResponseException(HttpStatus.CONFLICT, 
                        AppConstants.OUT_OF_STOCK,
                        "exception.invalid.quantity");
            }

            // Calculate deal (for DTO result only ~ ~)
            double deal = book.getPrice() * book.getDiscount().doubleValue();
            detailQuantity += quantity;
            detailTotal += book.getPrice() * quantity;
            discountDeal += deal * quantity;

            // Decrease stock on checkout
            if (isCheckout) {
                bookRepo.decreaseStock(book.getId(), quantity);
            }

            // Add item into new detail
            orderDetail.addOrderItem(OrderItem.builder()
                    .price(book.getPrice())
                    .discount(book.getDiscount())
                    .book(book)
                    .quantity(quantity)
                    .build());
        }

        // Check coupon
        ICoupon shopCoupon = detail.getCoupon() == null 
                ? null // Null => User not select any coupon
                : coupons.containsKey(detail.getCoupon()) 
                    ? coupons.get(detail.getCoupon())
                    : couponRepo.recommendCoupon(shop.getId(), detailTotal - discountDeal, detailQuantity, user.getId()).orElse(null);

        // Validate + apply coupon
        if (shopCoupon != null
            && shopCoupon.getCoupon().getShop().getId().equals(shop.getId())
            && !couponService.isExpired(shopCoupon.getCoupon())) {
            CouponDiscountDTO discountFromCoupon = null;

            // Apply coupon
            if (couponRepo.hasUserUsedCoupon(shopCoupon.getCoupon().getId(), user.getId())) {

                shopCoupon.getCoupon().setIsUsed(true);

                if (isCheckout) {
                    var errorMsg = messageSerice.getMessage("exception.coupon.expired",
                        new Object[]{ detail.getCoupon() });
                    throw new HttpResponseException(
                            HttpStatus.CONFLICT,
                            AppConstants.COUPON_EXPIRED,
                            errorMsg);
                }
            } else {

                discountFromCoupon = couponService.applyCoupon(
                    shopCoupon.getCoupon(),
                    new CartStateRequest(detailTotal - discountDeal, 
                        shippingFee, 
                        detailQuantity, 
                        shop.getId()), 
                        user);
            }

            // Appliable coupon
            if (discountFromCoupon != null) {

                // Decrease usage on checkout
                if (isCheckout)  couponRepo.decreaseUsage(shopCoupon.getCoupon().getId());

                shopCoupon.getCoupon().setIsUsable(true); // Mark usable to map DTO result

                discountCoupon = discountFromCoupon.discountValue();
                discountShipping = discountFromCoupon.discountShipping();
            } else if (isCheckout) {

                var errorMsg = messageSerice.getMessage("exception.coupon.invalid",
                        new Object[]{ detail.getCoupon() });
                throw new HttpResponseException(
                        HttpStatus.CONFLICT,
                        AppConstants.INVALID_COUPON,
                        errorMsg);
            }
        }

        // Add discount deal & discount coupon
        discountValue += (discountDeal + discountCoupon);

        // Free
        if (discountValue >= detailTotal)
            discountValue = detailTotal;
        if (discountShipping >= shippingFee)
            discountShipping = shippingFee;

        // Set detail value
        orderDetail.setTotalPrice(detailTotal);
        orderDetail.setShippingFee(shippingFee);
        orderDetail.setDealDiscount(discountDeal);
        orderDetail.setDiscount(discountValue);
        orderDetail.setCouponDiscount(discountCoupon);
        orderDetail.setShippingDiscount(discountShipping);
        orderDetail.setTotalQuantity(detailQuantity);
        orderDetail.setShippingType(detail.getShippingType());
        orderDetail.setNote(detail.getNote());

        if (isCheckout) {
            orderDetail.setCoupon(shopCoupon != null ? shopCoupon.getCoupon() : null);
        } else {
            orderDetail.setCouponDTO(shopCoupon != null ? couponMapper.couponToDTO(shopCoupon) : null);
        }

        return orderDetail;
    }

    /**
     * Calculate shipping fee
     * 
     * @param origin      Origin address
     * @param destination Destination address
     * @param type    Shipping type
     * @return Shipping fee
     */
    private double calculateShippingFee(Address origin,
            Address destination,
            ShippingType type) {

        double baseFee = 1000;
        double shippingFee = !(destination == null || origin == null) 
                ? distanceCalculation(origin, destination) * baseFee
                : 10000; // Fixed fee for now

        if (type != null) shippingFee = shippingFee * type.getMultiplier().doubleValue();

        return shippingFee;
    }

    /**
     * Calculate distance between origin and destination
     * 
     * @param origin      Origin address
     * @param destination Destination address
     * @return Distance
     */
    private double distanceCalculation(Address origin,
            Address destination) {

        double distance = 10.0; // Fixed 10 meters for now
        return distance;
        // if (destination == null) return baseFee;
        //
        // // Mock shipping fee calculation based on address hash codes
        // // Using hash codes ensures consistent results for same addresses
        // int originHash = origin.hashCode();
        // int destHash = destination.hashCode();
        //
        // // Add variation based on address differences
        // double distanceFactor = Math.abs(originHash - destHash) % 50000;
        //
        // // Ensure minimum fee of 20000 and maximum of 100000
        // return Math.min(100000, Math.max(baseFee, baseFee + distanceFactor));
    }

    /**
     * Check if the user is the buyer of the order
     * 
     * @param receipt Order receipt
     * @param user    Current user
     * @return True if the user is the buyer of the order, false otherwise
     */
    protected boolean isValidBuyer(OrderReceipt receipt, Account user) {

        boolean isAdmin = CommonUtils.isAuthAdmin();
        return receipt.getUser().getId().equals(user.getId()) || isAdmin;
    }
}
