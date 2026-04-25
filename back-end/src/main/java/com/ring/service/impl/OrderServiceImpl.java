package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.common.CommonUtils;
import com.ring.dto.projection.books.IBookItem;
import com.ring.dto.projection.coupons.ICoupon;
import com.ring.dto.projection.orders.*;
import com.ring.dto.request.*;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.accounts.AddressDTO;
import com.ring.dto.response.coupons.CouponDiscountDTO;
import com.ring.dto.response.orders.*;
import com.ring.dto.request.ghn.GHNSwitchStatusRequest;
import com.ring.dto.request.ghn.GHNUpdateOrderRequest;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.HttpResponseException;
import com.ring.exception.PaymentException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.listener.events.OnCheckoutCompletedEvent;
import com.ring.mapper.CalculateMapper;
import com.ring.mapper.CouponMapper;
import com.ring.mapper.OrderMapper;
import com.ring.model.entity.*;
import com.ring.model.enums.*;
import com.ring.repository.*;
import com.ring.service.CaptchaService;
import com.ring.service.CouponService;
import com.ring.service.GHNService;
import com.ring.service.AddressService;
import com.ring.service.OrderService;
import com.ring.service.PaymentService;
import com.ring.dto.request.ghn.GHNFeeRequest;
import com.ring.dto.response.ghn.GHNSwitchStatusResponse;
import com.ring.dto.response.ghn.GHNOrderDetailResponse.GHNOrderDetail;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
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

import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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

    private final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderReceiptRepository orderRepo;
    private final OrderDetailRepository detailRepo;
    private final OrderItemRepository itemRepo;
    private final BookRepository bookRepo;
    private final ShopRepository shopRepo;
    private final CouponRepository couponRepo;
    private final AddressRepository addressRepo;
    private final PaymentInfoRepository paymentRepo;

    private final ApplicationEventPublisher eventPublisher;
    private final CouponService couponService;
    private final CaptchaService captchaService;
    private final PaymentService paymentService;
    private final AddressService addressService;
    private final GHNService ghnService;
    private final MessageService messageService;

    private final OrderMapper orderMapper;
    private final CalculateMapper calculateMapper;
    private final CouponMapper couponMapper;

    @Value("${ghn.default.service-type-id}")
    private Integer ghnDefaultServiceTypeId;

    @Value("${ghn.default.weight-grams}")
    private Integer ghnDefaultWeightGrams;

    @Value("${ghn.default.length-cm}")
    private Integer ghnDefaultLengthCm;

    @Value("${ghn.default.width-cm}")
    private Integer ghnDefaultWidthCm;

    @Value("${ghn.default.height-cm}")
    private Integer ghnDefaultHeightCm;

    @Value("${ghn.default.fallback-fee}")
    private Integer ghnDefaultFallbackFee;

    @Cacheable(cacheNames = AppConstants.CALCULATE)
    public CalculateDTO calculate(CalculateRequest request, Account user) {

        // Get address for calculation
        AddressRequest addressRequest = request.getAddress();
        Address address = null;
        if (addressRequest != null) {
            address = Address.builder()
                    .districtId(addressRequest.getDistrictId())
                    .wardCode(addressRequest.getWardCode())
                    .build();
        } else {
            AddressDTO addressDTO = addressService.getMyAddress(user);
            if (addressDTO != null) {
                address = Address.builder()
                        .districtId(addressDTO.districtId())
                        .wardCode(addressDTO.wardCode())
                        .build();
            }
        }

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
    public CreatePaymentLinkResponse checkout(OrderRequest checkRequest,
            HttpServletRequest request,
            Account user) {

        CreatePaymentLinkResponse paymentLink = null;

        // Captcha validation
        final String captchaToken = request.getHeader(AppConstants.HEADER_RESPONSE);
        final String source = request.getHeader(AppConstants.HEADER_CAPTCHA_SOURCE);
        captchaService.validate(captchaToken, source, CaptchaServiceImpl.CHECKOUT_ACTION);

        // Create new address
        AddressRequest addressRequest = checkRequest.getAddress();
        var address = Address.builder()
                .name(addressRequest.getName())
                .companyName(addressRequest.getCompanyName())
                .phone(addressRequest.getPhone())
                .detail(addressRequest.getDetail())
                .address(addressRequest.getAddress())
                .provinceId(addressRequest.getProvinceId() != null
                        ? addressRequest.getProvinceId().intValue()
                        : null)
                .districtId(addressRequest.getDistrictId() != null
                        ? addressRequest.getDistrictId().intValue()
                        : null)
                .wardCode(addressRequest.getWardCode())
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
                .amount((long) Math.floor(orderReceipt.getTotal() - orderReceipt.getTotalDiscount()))
                .build();

        // Set relevant values
        orderReceipt.setUser(user);
        orderReceipt.setEmail(user.getEmail());
        orderReceipt.setAddress(savedAddress);

        orderReceipt.setPayment(paymentInfo);
        OrderReceipt savedOrderReceipt = orderRepo.save(orderReceipt);

        ReceiptDTO receiptDTO = orderMapper.orderToDTO(orderReceipt);

        if (checkRequest.getPaymentMethod().equals(PaymentType.ONLINE_PAYMENT)) {
            try {
                paymentLink = paymentService.checkout(receiptDTO);

                paymentInfo.setCheckoutUrl(paymentLink.getCheckoutUrl());
                paymentInfo.setStatus(PaymentStatus.valueOf(paymentLink.getStatus().getValue()));
                paymentInfo.setAmount(paymentLink.getAmount());
                paymentInfo.setDescription(paymentLink.getDescription());
                paymentInfo.setExpiredAt(Instant.ofEpochSecond(paymentLink.getExpiredAt())
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime());

                orderRepo.save(orderReceipt);
            } catch (PaymentException ignored) {
            }
        } else if (checkRequest.getPaymentMethod().equals(PaymentType.CASH)) {
            // Create GHN orders immediately for cash checkout
            eventPublisher.publishEvent(new OnCheckoutCompletedEvent(
                    user.getUsername(),
                    user.getEmail(),
                    savedOrderReceipt,
                    PaymentType.CASH));
        }

        return paymentLink;
    }

    @Cacheable(cacheNames = AppConstants.PAYMENT, key = "#id")
    @Transactional
    public PaymentInfo createPaymentLink(HttpServletRequest request,
            Long id) {

        // Captcha validation
        final String captchaToken = request.getHeader(AppConstants.HEADER_RESPONSE);
        final String source = request.getHeader(AppConstants.HEADER_CAPTCHA_SOURCE);
        captchaService.validate(captchaToken, source,
                CaptchaServiceImpl.PAYMENT_ACTION);

        PaymentInfo paymentInfo = paymentRepo.findByOrder(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.payment") });
                    return new ResourceNotFoundException(errorMsg);
                });

        if (paymentInfo.getPaymentType().equals(PaymentType.ONLINE_PAYMENT)
                && paymentInfo.getStatus().equals(PaymentStatus.PENDING)
                && paymentInfo.getCheckoutUrl() == null) {
            ReceiptDTO receiptDTO = this.getReceipt(id);
            CreatePaymentLinkResponse paymentLink = paymentService.checkout(receiptDTO);

            LocalDateTime expiredAt = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(paymentLink.getExpiredAt()),
                    ZoneId.systemDefault());

            paymentInfo.setCheckoutUrl(paymentLink.getCheckoutUrl());
            paymentInfo.setStatus(PaymentStatus.valueOf(paymentLink.getStatus().getValue()));
            paymentInfo.setAmount(paymentLink.getAmount());
            paymentInfo.setDescription(paymentLink.getDescription());
            paymentInfo.setExpiredAt(expiredAt);

            paymentRepo.save(paymentInfo);
        }

        return paymentInfo;
    }

    @Cacheable(cacheNames = AppConstants.PAYMENT_LINK, key = "#id")
    public PaymentLink getPaymentLinkData(Long id) {
        return paymentService.getPaymentLinkData(id);
    }

    @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS }, allEntries = true)
    @Transactional
    public void cancel(Long id, String reason, Account user) {

        OrderDetail detail = detailRepo.findDetailById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check valid status for cancel
        OrderStatus currStatus = detail.getStatus();
        if (!OrderStatus.PENDING.equals(currStatus)) {

            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { new DefaultMessageSourceResolvable("label.order.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                    AppConstants.INVALID_ARGUMENT,
                    errorMsg);
        }

        // Check if correct user
        OrderReceipt order = detail.getOrder();
        if (!isValidBuyer(order, user)) {

            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        // Cancel on GHN if created
        if (StringUtils.isNotBlank(detail.getOrderCode())) {
            GHNSwitchStatusResponse ghnRes = ghnService.cancelOrders(GHNSwitchStatusRequest.builder()
                    .orderCodes(List.of(detail.getOrderCode()))
                    .build());
            if (ghnRes == null || ghnRes.getCode() == null || ghnRes.getCode() != HttpStatus.OK.value()) {
                throw new HttpResponseException(HttpStatus.BAD_GATEWAY, AppConstants.GHN_FAILED,
                        "GHN cancel order failed");
            }
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
            @CacheEvict(cacheNames = AppConstants.PAYMENT, key = "#orderId"),
            @CacheEvict(cacheNames = AppConstants.PAYMENT_LINK, key = "#orderId") })
    @Transactional
    public void cancelUnpaidOrder(Long orderId, String reason, Account user) {

        OrderReceipt order = orderRepo.findById(orderId)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if correct user
        if (!isValidBuyer(order, user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        PaymentInfo paymentInfo = paymentRepo.findByOrder(order.getId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.payment") });
                    return new ResourceNotFoundException(errorMsg);
                });

        if (!PaymentStatus.PENDING.equals(paymentInfo.getStatus())) {

            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { new DefaultMessageSourceResolvable(
                            "label.order.payment.status") });
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
                PaymentLink paymentData = paymentService.cancel(order.getId(), reason);
                paymentInfo.setExpiredAt(null);
                paymentInfo.setStatus(PaymentStatus.valueOf(paymentData.getStatus().getValue()));
            } catch (Exception ignored) {
                paymentInfo.setStatus(PaymentStatus.CANCELLED);
            }
        } else {
            paymentInfo.setStatus(PaymentStatus.CANCELLED);
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
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check valid status for cancel
        OrderStatus currStatus = detail.getStatus();
        if (!OrderStatus.COMPLETED.equals(currStatus)) {

            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { new DefaultMessageSourceResolvable("label.order.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                    AppConstants.INVALID_ARGUMENT,
                    errorMsg);
        }

        // Check if correct user
        OrderReceipt order = detail.getOrder();
        if (!isValidBuyer(order, user)) {

            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        if (order.getLastModifiedDate()
                .plus(1, ChronoUnit.WEEKS)
                .isAfter(LocalDateTime.now())) {
            var errorMsg = messageService.getMessage("exception.date.invalid",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
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
            @CacheEvict(cacheNames = AppConstants.PAYMENT, key = "#orderId"),
            @CacheEvict(cacheNames = AppConstants.PAYMENT_LINK, key = "#orderId") })
    @Transactional
    public void changePaymentMethod(Long orderId,
            PaymentType paymentMethod,
            Account user) {

        OrderReceipt order = orderRepo.findById(orderId)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if correct user
        if (!isValidBuyer(order, user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        PaymentInfo paymentInfo = paymentRepo.findByOrder(order.getId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.payment") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check valid status for cancel
        if (!PaymentStatus.PENDING.equals(paymentInfo.getStatus())) {
            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { new DefaultMessageSourceResolvable(
                            "label.order.payment.status") });
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
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check valid status for cancel
        OrderStatus currStatus = detail.getStatus();
        if (!OrderStatus.SHIPPING.equals(currStatus)) {
            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { new DefaultMessageSourceResolvable("label.order.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                    AppConstants.INVALID_ARGUMENT,
                    errorMsg);
        }

        PaymentInfo paymentInfo = paymentRepo.findByOrder(detail.getOrder().getId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.payment") });
                    return new ResourceNotFoundException(errorMsg);
                });

        if (!PaymentStatus.PAID.equals(paymentInfo.getStatus())) {
            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { new DefaultMessageSourceResolvable(
                            "label.order.payment.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                    AppConstants.INVALID_ARGUMENT,
                    errorMsg);
        }

        // Check if correct user
        if (!isValidBuyer(detail.getOrder(), user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        detail.setStatus(OrderStatus.COMPLETED);
        detailRepo.save(detail);
    }

    @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS,
            AppConstants.RECEIPTS, AppConstants.SALES }, allEntries = true)
    @Transactional
    public void requestReturn(Long id, String reason, Account user) {

        OrderDetail detail = detailRepo.findDetailById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if correct user
        OrderReceipt order = detail.getOrder();
        if (!isValidBuyer(order, user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        // Only allow return request for shipping/completed orders
        OrderStatus currStatus = detail.getStatus();
        if (!(OrderStatus.SHIPPING.equals(currStatus) || OrderStatus.COMPLETED.equals(currStatus))) {
            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { new DefaultMessageSourceResolvable("label.order.status") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                    AppConstants.INVALID_ARGUMENT,
                    errorMsg);
        }

        // Switch GHN status to return if GHN order exists
        if (StringUtils.isNotBlank(detail.getOrderCode())) {
            GHNSwitchStatusResponse ghnRes = ghnService.returnOrders(GHNSwitchStatusRequest.builder()
                    .orderCodes(List.of(detail.getOrderCode()))
                    .build());
            if (ghnRes == null || ghnRes.getCode() == null || ghnRes.getCode() != HttpStatus.OK.value()) {
                throw new HttpResponseException(HttpStatus.BAD_GATEWAY, AppConstants.GHN_FAILED,
                        "GHN return order failed");
            }
        }

        detail.setStatus(OrderStatus.PENDING_RETURN);
        detail.setNote(reason);
        detailRepo.save(detail);
    }

    @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS,
            AppConstants.RECEIPTS, AppConstants.SALES }, allEntries = true)
    @Transactional
    public void updateShippingNote(Long id, String note, Account user) {

        OrderDetail detail = detailRepo.findDetailById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });

        if (!CommonUtils.isValidShopOwner(detail.getShop(), user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        if (StringUtils.isBlank(detail.getOrderCode())) {
            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
            throw new HttpResponseException(HttpStatus.CONFLICT, AppConstants.INVALID_ARGUMENT, errorMsg);
        }

        ghnService.updateOrder(GHNUpdateOrderRequest.builder()
                .orderCode(detail.getOrderCode())
                .note(note)
                .build());

        detail.setNote(note);
        detailRepo.save(detail);
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS,
                    AppConstants.RECEIPTS, AppConstants.SALES }, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.PAYMENT, key = "#id"),
            @CacheEvict(cacheNames = AppConstants.PAYMENT_LINK, key = "#id") })
    @Transactional
    public void changeStatus(Long id,
            OrderStatus status,
            Account user) {

        OrderDetail detail = detailRepo.findDetailById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });
        OrderReceipt order = detail.getOrder();

        // Check if correct user
        if (!CommonUtils.isValidShopOwner(detail.getShop(), user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
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
        List<ReceiptDTO> ordersList = orderMapper.receiptsToDTOs(
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
    public PagingResponse<OrderSummaryDTO> getSummariesWithFilter(Account user,
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

        Page<IOrderSummary> summariesList = orderRepo.findAllSummaries(shopId,
                isAdmin ? null : user.getId(),
                bookId,
                pageable);

        if (summariesList == null) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.order") });
            throw new EntityOwnershipException(errorMsg);
        }

        List<OrderSummaryDTO> summariesDTOS = summariesList.map(orderMapper::summaryToDTO).toList();
        return new PagingResponse<>(
                summariesDTOS,
                summariesList.getTotalPages(),
                summariesList.getTotalElements(),
                summariesList.getSize(),
                summariesList.getNumber(),
                summariesList.isEmpty());
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
        List<OrderDTO> ordersList = orderMapper.ordersToDTOs(details.getContent(), items);
        return new PagingResponse<>(
                ordersList,
                details.getTotalPages(),
                details.getTotalElements(),
                details.getSize(),
                details.getNumber(),
                details.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.RECEIPTS, key = "#id")
    @Transactional
    public ReceiptDTO getReceipt(Long id) {

        OrderReceipt order = orderRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order") });
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
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order.detail") });
                    return new ResourceNotFoundException(errorMsg);
                });
        List<IOrderItem> items = itemRepo.findAllWithDetailIds(List.of(detailProjection.getId()));

        return orderMapper.detailsToDetailDTO(detailProjection, items);
    }

    public GHNOrderDetail getGHNOrderDetail(Long id, Account user) {

        boolean isAdmin = CommonUtils.isAuthAdmin();
        String orderCode = detailRepo.findOrderCodeById(id, isAdmin ? null : user.getId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.ghn.order") });
                    return new ResourceNotFoundException(errorMsg);
                });
        return ghnService.getOrderDetail(orderCode);
    }

    @Transactional
    public CheckoutDetailDTO getCheckoutDetail(Long id, Account user) {

        boolean isAdmin = CommonUtils.isAuthAdmin();
        ICheckoutDetail checkoutProjection = orderRepo.findCheckoutDetail(id, isAdmin ? null : user.getId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.order") });
                    return new ResourceNotFoundException(errorMsg);
                });
        List<IOrder> details = detailRepo.findAllByReceiptId(id);
        List<Long> orderIds = details.stream().map(IOrder::getId).collect(Collectors.toList());
        List<IOrderItem> items = itemRepo.findAllWithDetailIds(orderIds);
        List<OrderDTO> ordersList = orderMapper.ordersToDTOs(details, items);
        CheckoutDetailDTO checkoutDTO = orderMapper.checkDetailsToDTO(
                checkoutProjection,
                ordersList); // Map to DTO
        return checkoutDTO;
    }

    @Cacheable(cacheNames = AppConstants.SALES)
    public SalesInfoDTO getSales(Account user, Long shopId, Long bookId, LocalDate startDate, LocalDate endDate) {

        boolean isAdmin = CommonUtils.isAuthAdmin();

        // Dates validation
        LocalDateTime startDateTime = startDate == null ? LocalDateTime.now() : startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate == null ? LocalDateTime.now() : endDate.atStartOfDay();
        if (startDateTime.isAfter(endDateTime)) {
            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { new DefaultMessageSourceResolvable("label.date") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                    AppConstants.INVALID_ARGUMENT,
                    errorMsg);
        }

        // Get range start and end
        List<Map<String, Object>> data = orderRepo.getSales(shopId,
                isAdmin ? null : user.getId(),
                bookId,
                startDateTime,
                endDateTime);

        SalesInfoDTO salesInfoDTO = orderMapper.salesDataToDTO(data, startDate, endDate);
        return salesInfoDTO;
    }

    /**
     * Build an order receipt from cart details and apply optional global coupon.
     *
     * @param cart          cart details grouped by shop
     * @param orderCoupon   global (order-level) coupon code
     * @param address       shipping address
     * @param paymentMethod selected payment method
     * @param user          current user
     * @param isCheckout    true to enforce strict validation and persist side
     *                      effects;
     *                      false to generate preview values without destructive
     *                      updates
     * @return processed order receipt
     */
    private OrderReceipt processOrder(List<CartDetailRequest> cart,
            String orderCoupon,
            Address address,
            PaymentType paymentMethod,
            Account user,
            boolean isCheckout) {

        // Initialize receipt container.
        var orderReceipt = OrderReceipt.builder()
                .details(new ArrayList<>())
                .build();

        // Collect ids/codes for batched prefetch.
        List<Long> bookIds = cart.stream()
                .flatMap(detail -> detail.getItems() == null
                        ? java.util.stream.Stream.<CartItemRequest>empty()
                        : detail.getItems().stream())
                .map(CartItemRequest::getId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        List<Long> shopIds = cart.stream()
                .map(CartDetailRequest::getShopId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        List<String> couponCodes = cart.stream()
                .map(CartDetailRequest::getCoupon)
                .filter(StringUtils::isNotBlank)
                .distinct()
                .collect(Collectors.toList());

        // Include global coupon code in prefetch set.
        if (StringUtils.isNotBlank(orderCoupon) && !couponCodes.contains(orderCoupon)) {
            couponCodes.add(orderCoupon);
        }

        // Fetch maps for O(1) lookup during detail processing.
        Map<Long, Shop> shops = shopRepo.findShopsInIds(shopIds)
                .stream()
                .collect(Collectors.toMap(Shop::getId, Function.identity()));
        Map<Long, IBookItem> books = bookRepo.findBookItemsInIds(bookIds)
                .stream()
                .collect(Collectors.toMap(IBookItem::getId, Function.identity()));
        Map<String, ICoupon> coupons = couponRepo.findCouponInCodes(couponCodes)
                .stream()
                .collect(Collectors.toMap(coupon -> coupon.getCoupon().getCode(), Function.identity()));

        // Running totals across all shop details.
        double totalPrice = 0.0;
        double totalShippingFee = 0.0;
        double totalDealDiscount = 0.0;
        double totalCouponDiscount = 0.0;
        double totalShippingDiscount = 0.0;
        int totalQuantity = 0;

        // Process each shop detail and aggregate totals.
        for (CartDetailRequest detail : cart) {
            OrderDetail orderDetail = processOrderDetail(detail,
                    shops,
                    books,
                    coupons,
                    address,
                    paymentMethod,
                    user,
                    isCheckout);

            orderReceipt.addOrderDetail(orderDetail);

            totalPrice += orderDetail.getTotalPrice() != null ? orderDetail.getTotalPrice() : 0.0;
            totalQuantity += orderDetail.getTotalQuantity() != null ? orderDetail.getTotalQuantity() : 0;
            totalShippingFee += orderDetail.getShippingFee() != null ? orderDetail.getShippingFee() : 0.0;
            totalCouponDiscount += orderDetail.getCouponDiscount() != null ? orderDetail.getCouponDiscount()
                    : 0.0;
            totalShippingDiscount += orderDetail.getShippingDiscount() != null
                    ? orderDetail.getShippingDiscount()
                    : 0.0;
            totalDealDiscount += orderDetail.getDealDiscount() != null ? orderDetail.getDealDiscount()
                    : 0.0;
        }

        // If user provided a coupon code, it must resolve from preloaded coupon map.
        // Else give recommend coupon if not exists.
        ICoupon cProjection = orderCoupon == null
                ? null // Null => User not select any coupon
                : coupons.containsKey(orderCoupon)
                        ? coupons.get(orderCoupon)
                        : couponRepo.recommendCoupon(null, totalPrice - totalDealDiscount,
                                totalQuantity, user.getId())
                                .orElse(null);

        Coupon coupon = cProjection != null ? cProjection.getCoupon() : null;
        if (coupon != null && coupon.getShop() == null
                && !couponService.isExpired(coupon)) {

            // Global coupon values before distributing to details.
            double discountValue = 0.0;
            double shippingDiscount = 0.0;
            double value = totalPrice - totalDealDiscount - totalCouponDiscount;
            double shipping = totalShippingFee - totalShippingDiscount;

            CouponDiscountDTO discountFromCoupon = null;
            if (couponRepo.hasUserUsedCoupon(coupon.getId(), user.getId())) {

                coupon.setIsUsed(true);
                if (isCheckout) {

                    var errorMsg = messageService.getMessage("exception.coupon.expired",
                            new Object[] { orderCoupon });
                    throw new HttpResponseException(
                            HttpStatus.CONFLICT,
                            AppConstants.COUPON_EXPIRED,
                            errorMsg);
                }
            } else if (value > 0 && totalQuantity > 0) {

                discountFromCoupon = couponService.applyCoupon(coupon,
                        new CartStateRequest(value,
                                shipping,
                                totalQuantity,
                                null),
                        user);
            }

            if (discountFromCoupon != null) {

                // Consume usage only during checkout.
                if (isCheckout)
                    couponRepo.decreaseUsage(coupon.getId());

                coupon.setIsUsable(true); // Mark usable for DTO result mapping

                discountValue = discountFromCoupon.discountValue();
                shippingDiscount = discountFromCoupon.discountShipping();

                // Distribute product coupon discount across details and force exact sum.
                if (discountValue > 0 && value > 0) {
                    double discountRatio = discountValue / value;
                    int discountableDetails = 0;
                    for (OrderDetail detail : orderReceipt.getDetails()) {
                        double currentDiscount = detail.getDiscount() != null
                                ? detail.getDiscount()
                                : 0.0;
                        double detailValueBase = Math.max(0.0,
                                detail.getTotalPrice() - currentDiscount);
                        if (detailValueBase > 0) {
                            discountableDetails++;
                        }
                    }

                    if (discountableDetails > 0) {
                        double allocatedDiscount = 0.0;
                        int detailIndex = 0;
                        for (OrderDetail detail : orderReceipt.getDetails()) {
                            double currentDiscount = detail.getDiscount() != null
                                    ? detail.getDiscount()
                                    : 0.0;
                            double detailValueBase = Math.max(0.0,
                                    detail.getTotalPrice() - currentDiscount);
                            if (detailValueBase <= 0) {
                                continue;
                            }

                            detailIndex++;
                            double applyDiscount = detailIndex == discountableDetails
                                    ? Math.max(0.0, discountValue
                                            - allocatedDiscount)
                                    : detailValueBase * discountRatio;
                            allocatedDiscount += applyDiscount;
                            detail.setDiscount(currentDiscount + applyDiscount);
                        }
                    }
                }

                // Distribute shipping coupon discount across details and force exact sum.
                if (shippingDiscount > 0 && shipping > 0) {
                    double shippingDiscountRatio = shippingDiscount / shipping;
                    int shippingDiscountableDetails = 0;
                    for (OrderDetail detail : orderReceipt.getDetails()) {
                        double currentShippingDiscount = detail.getShippingDiscount() != null
                                ? detail.getShippingDiscount()
                                : 0.0;
                        double detailShippingBase = Math.max(0.0,
                                detail.getShippingFee() - currentShippingDiscount);
                        if (detailShippingBase > 0) {
                            shippingDiscountableDetails++;
                        }
                    }

                    if (shippingDiscountableDetails > 0) {
                        double allocatedShippingDiscount = 0.0;
                        int detailIndex = 0;
                        for (OrderDetail detail : orderReceipt.getDetails()) {
                            double currentShippingDiscount = detail
                                    .getShippingDiscount() != null
                                            ? detail.getShippingDiscount()
                                            : 0.0;
                            double detailShippingBase = Math.max(0.0,
                                    detail.getShippingFee()
                                            - currentShippingDiscount);
                            if (detailShippingBase <= 0) {
                                continue;
                            }

                            detailIndex++;
                            double applyShippingDiscount = detailIndex == shippingDiscountableDetails
                                    ? Math.max(0.0, shippingDiscount
                                            - allocatedShippingDiscount)
                                    : detailShippingBase * shippingDiscountRatio;
                            allocatedShippingDiscount += applyShippingDiscount;
                            detail.setShippingDiscount(currentShippingDiscount
                                    + applyShippingDiscount);
                        }
                    }
                }
            } else if (isCheckout) {
                var errorMsg = messageService.getMessage("exception.coupon.invalid",
                        new Object[] { orderCoupon });
                throw new HttpResponseException(
                        HttpStatus.CONFLICT,
                        AppConstants.INVALID_COUPON,
                        errorMsg);
            }

            // Add order-level coupon values into receipt-level totals.
            totalCouponDiscount += discountValue;
            totalShippingDiscount += shippingDiscount;
        }

        // Receipt discount = deal + coupon + shipping discounts.
        double totalDiscount = totalCouponDiscount + totalDealDiscount + totalShippingDiscount;

        // Populate receipt summary fields.
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
     * Process one cart detail (items from a single shop).
     *
     * @param detail        cart detail request
     * @param shops         preloaded shops keyed by shop id
     * @param bookItems     preloaded book items keyed by book id
     * @param coupons       preloaded coupons keyed by coupon code
     * @param address       shipping address
     * @param paymentMethod selected payment method
     * @param user          current user
     * @param isCheckout    true to enforce strict validation and persist
     *                      stock/coupon updates;
     *                      false to build a preview result without destructive
     *                      updates
     * @return processed order detail
     */
    private OrderDetail processOrderDetail(CartDetailRequest detail,
            Map<Long, Shop> shops,
            Map<Long, IBookItem> bookItems,
            Map<String, ICoupon> coupons,
            Address address,
            PaymentType paymentMethod,
            Account user,
            boolean isCheckout) {

        // Reject missing shop/items on checkout; keep a lightweight placeholder for
        // preview.
        Shop shop = shops.get(detail.getShopId());
        List<CartItemRequest> items = detail.getItems();
        if (shop == null || items == null || items.isEmpty()) {
            if (isCheckout) {
                var errorMsg = messageService.getMessage("exception.not.found",
                        new Object[] { new DefaultMessageSourceResolvable("label.shop") });
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

        // Payment lifecycle: cash can go straight to pending, online waits for payment.
        OrderStatus status = paymentMethod == PaymentType.CASH
                ? OrderStatus.PENDING
                : OrderStatus.PENDING_PAYMENT;
        OrderDetail orderDetail = OrderDetail.builder()
                .status(status)
                .shop(shop)
                .items(new ArrayList<>()).build();

        // Accumulators for pricing and discounts in this shop detail.
        double detailTotal = 0.0;
        double discountDeal = 0.0;
        double discountCoupon = 0.0;
        double discountValue = 0.0;
        double discountShipping = 0.0;
        int weightGrams = 0;
        int lengthCm = 0;
        int widthCm = 0;
        int heightCm = 0;
        int detailQuantity = 0;

        // Process each item in detail
        for (CartItemRequest item : items) {

            // Validate book existence and ownership by current shop.
            IBookItem bookItem = bookItems.get(item.getId());
            Book book = bookItem.getBook();
            if (book == null || book.getShop() == null || !book.getShop().getId().equals(shop.getId())) {

                if (isCheckout) {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable(
                                    "label.product") });
                    throw new ResourceNotFoundException(errorMsg);
                }

                // Preview path: keep placeholder item so client can map invalid rows.
                var orderItem = OrderItem.builder()
                        .book(Book.builder().id(item.getId()).build())
                        .build();

                orderDetail.addOrderItem(orderItem);
                continue;
            }

            // Reject invalid quantity on checkout, keep placeholder in preview mode.
            short quantity = item.getQuantity();
            if (quantity < 1 || quantity > book.getAmount()) {
                if (!isCheckout) {
                    orderDetail.addOrderItem(OrderItem.builder()
                            .book(Book.builder().id(item.getId()).build())
                            .quantity(quantity)
                            .build());
                    continue;
                }

                throw new HttpResponseException(HttpStatus.CONFLICT,
                        AppConstants.OUT_OF_STOCK,
                        "exception.invalid.quantity");
            }

            // Book-level deal savings participate in coupon base and final totals.
            BigDecimal bookDiscount = book.getDiscount() != null ? book.getDiscount() : BigDecimal.ZERO;
            double deal = book.getPrice() * bookDiscount.doubleValue();
            detailQuantity += quantity;
            detailTotal += book.getPrice() * quantity;
            discountDeal += deal * quantity;

            // Aggregate package dimensions for this shop shipment:
            // - weight: sum(item's weight * quantity)
            // - height: sum(item's height * quantity)
            // - length/width: max(item's length/width * quantity)
            weightGrams += (int) (bookItem.getWeight() * quantity);
            heightCm += (int) (bookItem.getHeight() * quantity);
            lengthCm = Math.max(lengthCm, (int) bookItem.getLength());
            widthCm = Math.max(widthCm, (int) bookItem.getWidth());

            // Decrease stock on checkout
            if (isCheckout) {
                bookRepo.decreaseStock(book.getId(), quantity);
            }

            // Add item into new detail
            orderDetail.addOrderItem(OrderItem.builder()
                    .price(book.getPrice())
                    .discount(bookDiscount)
                    .book(book)
                    .quantity(quantity)
                    .build());
        }

        // Persist package attributes used for GHN fee calculation (fallback to defaults
        // when missing/zero)
        weightGrams = weightGrams > 0 ? weightGrams : ghnDefaultWeightGrams;
        lengthCm = lengthCm > 0 ? lengthCm : ghnDefaultLengthCm;
        widthCm = widthCm > 0 ? widthCm : ghnDefaultWidthCm;
        heightCm = heightCm > 0 ? heightCm : ghnDefaultHeightCm;
        orderDetail.setWeightGrams(weightGrams);
        orderDetail.setLengthCm(lengthCm);
        orderDetail.setWidthCm(widthCm);
        orderDetail.setHeightCm(heightCm);

        int shippingFee = calculateShippingFee(
                address.getDistrictId(),
                address.getWardCode(),
                detail.getShippingType() != null ? detail.getShippingType() : ghnDefaultServiceTypeId,
                null, // TODO: get GHN shop ID from shop
                (int) detailTotal,
                weightGrams,
                lengthCm,
                widthCm,
                heightCm);

        // If user provided a coupon code, it must resolve from preloaded coupon map.
        // Else give recommend coupon if not exists.
        ICoupon shopCoupon = detail.getCoupon() == null
                ? null // Null => User not select any coupon
                : coupons.containsKey(detail.getCoupon())
                        ? coupons.get(detail.getCoupon())
                        : couponRepo
                                .recommendCoupon(shop.getId(),
                                        detailTotal - discountDeal,
                                        detailQuantity, user.getId())
                                .orElse(null);

        // Validate and apply shop coupon only when it belongs to this shop and is not
        // expired.
        if (shopCoupon != null
                && shopCoupon.getCoupon().getShop().getId().equals(shop.getId())
                && !couponService.isExpired(shopCoupon.getCoupon())) {
            CouponDiscountDTO discountFromCoupon = null;

            // Block reused coupons for this user.
            if (couponRepo.hasUserUsedCoupon(shopCoupon.getCoupon().getId(), user.getId())) {

                shopCoupon.getCoupon().setIsUsed(true);

                if (isCheckout) {
                    var errorMsg = messageService.getMessage("exception.coupon.expired",
                            new Object[] { detail.getCoupon() });
                    throw new HttpResponseException(
                            HttpStatus.CONFLICT,
                            AppConstants.COUPON_EXPIRED,
                            errorMsg);
                }
            } else if (detailTotal > 0 && detailQuantity > 0) {

                discountFromCoupon = couponService.applyCoupon(
                        shopCoupon.getCoupon(),
                        new CartStateRequest(detailTotal - discountDeal,
                                (double) shippingFee,
                                detailQuantity,
                                shop.getId()),
                        user);
            }

            // Coupon is applicable; update usage on checkout and distribute discount.
            if (discountFromCoupon != null) {

                // Decrease usage on checkout
                if (isCheckout)
                    couponRepo.decreaseUsage(shopCoupon.getCoupon().getId());

                shopCoupon.getCoupon().setIsUsable(true); // Mark usable to map DTO result

                discountCoupon = discountFromCoupon.discountValue();
                discountShipping = discountFromCoupon.discountShipping();

                // Split coupon discount across priced items and keep sum exactly equal
                // to detail-level coupon discount.
                int totalItems = orderDetail.getItems().size();
                if (discountCoupon > 0 && detailTotal > 0 && totalItems > 0) {
                    double discountRatio = discountCoupon / detailTotal;
                    double allocatedDiscount = 0.0;

                    for (int i = 0; i < totalItems; i++) {
                        OrderItem item = orderDetail.getItems().get(i);
                        if (item.getPrice() == null || item.getQuantity() == null) {
                            continue;
                        }

                        double itemDiscount = i == totalItems - 1
                                ? Math.max(0.0, discountCoupon - allocatedDiscount)
                                : Math.round(item.getPrice() * item.getQuantity()
                                        * discountRatio);
                        allocatedDiscount += itemDiscount;
                        item.setCouponDiscount(itemDiscount);
                    }
                }
            } else if (isCheckout) {

                var errorMsg = messageService.getMessage("exception.coupon.invalid",
                        new Object[] { detail.getCoupon() });
                throw new HttpResponseException(
                        HttpStatus.CONFLICT,
                        AppConstants.INVALID_COUPON,
                        errorMsg);
            }
        }

        // Detail discount is book deals plus coupon discount.
        discountValue += discountDeal + discountCoupon;

        // Never allow discount values to exceed payable amounts.
        if (discountValue >= detailTotal)
            discountValue = detailTotal;
        if (discountShipping >= shippingFee)
            discountShipping = shippingFee;

        // Assign computed totals and request metadata to detail.
        orderDetail.setTotalPrice(detailTotal);
        orderDetail.setShippingFee((double) shippingFee);
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
     * @param fromDistrictId Origin district ID
     * @param fromWardCode   Origin ward code
     * @param toDistrictId   Destination district ID
     * @param toWardCode     Destination ward code
     * @param serviceTypeId  Service type ID
     * @param ghnShopId      GHN shop ID
     * @param insuranceValue Insurance value in VND
     * @param weight         Weight in grams
     * @param length         Length in centimeters
     * @param width          Width in centimeters
     * @param height         Height in centimeters
     * @return Shipping fee in VND
     */
    private Integer calculateShippingFee(
            Integer toDistrictId,
            String toWardCode,
            Integer serviceTypeId,
            Integer ghnShopId,
            Integer insuranceValue,
            Integer weight,
            Integer length,
            Integer width,
            Integer height) {

        // Destination validation
        if (toDistrictId == null || toWardCode == null) {
            return ghnDefaultFallbackFee;
        }

        GHNFeeRequest feeRequest = GHNFeeRequest.builder()
                .serviceTypeId(serviceTypeId != null ? serviceTypeId : ghnDefaultServiceTypeId)
                .toDistrictId(toDistrictId)
                .toWardCode(toWardCode)
                .weight(weight)
                .length(length)
                .width(width)
                .height(height)
                .insuranceValue(insuranceValue)
                .build();

        Integer calculatedFee = ghnService.calculateFee(feeRequest, null);
        return calculatedFee != null ? calculatedFee : ghnDefaultFallbackFee;
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
