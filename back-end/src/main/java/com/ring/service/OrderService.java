package com.ring.service;

import com.ring.dto.request.CalculateRequest;
import com.ring.dto.request.OrderRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.orders.*;
import com.ring.model.entity.Account;
import com.ring.model.entity.PaymentInfo;
import com.ring.model.enums.OrderStatus;
import com.ring.model.enums.PaymentType;
import jakarta.servlet.http.HttpServletRequest;
import com.ring.dto.response.ghn.GHNOrderDetailResponse.GHNOrderDetail;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;

import java.time.LocalDate;

/**
 * Service interface for handling order-related operations.
 */
public interface OrderService {

    /**
     * Retrieves all receipts with pagination and filtering options.
     *
     * @param user     the authenticated user
     * @param shopId   the shop ID to filter by
     * @param status   the order status to filter by
     * @param keyword  the search keyword to filter receipts
     * @param pageNo   the page number for pagination
     * @param pageSize the size of each page
     * @param sortBy   the field to sort by
     * @param sortDir  the sorting direction (asc/desc)
     * @return a paginated list of {@link ReceiptDTO} objects
     */
    PagingResponse<ReceiptDTO> getAllReceipts(Account user,
            Long shopId,
            OrderStatus status,
            String keyword,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir);

    /**
     * Retrieves receipt summaries with filtering options.
     *
     * @param user     the authenticated user
     * @param shopId   the shop ID to filter by
     * @param bookId   the book ID to filter by
     * @param pageNo   the page number for pagination
     * @param pageSize the size of each page
     * @param sortBy   the field to sort by
     * @param sortDir  the sorting direction (asc/desc)
     * @return a paginated list of {@link OrderSummaryDTO} objects
     */
    PagingResponse<OrderSummaryDTO> getSummariesWithFilter(Account user,
            Long shopId,
            Long bookId,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir);

    /**
     * Retrieves orders by user with pagination and filtering options.
     *
     * @param user     the authenticated user
     * @param status   the order status to filter by
     * @param keyword  the search keyword to filter orders
     * @param pageNo   the page number for pagination
     * @param pageSize the size of each page
     * @return a paginated list of {@link OrderDTO} objects
     */
    PagingResponse<OrderDTO> getOrdersByUser(Account user,
            OrderStatus status,
            String keyword,
            Integer pageNo,
            Integer pageSize);

    /**
     * Retrieves a receipt by its ID.
     *
     * @param id the ID of the receipt
     * @return the {@link ReceiptDTO} object
     */
    ReceiptDTO getReceipt(Long id);

    /**
     * Retrieves detailed checkout information by ID.
     *
     * @param id   the ID of the checkout
     * @param user the authenticated user
     * @return the {@link CheckoutDetailDTO} object
     */
    CheckoutDetailDTO getCheckoutDetail(Long id,
            Account user);

    /**
     * Retrieves detailed order information by ID.
     *
     * @param id   the ID of the order
     * @param user the authenticated user
     * @return the {@link OrderDetailDTO} object
     */
    OrderDetailDTO getOrderDetail(Long id,
            Account user);

    /**
     * Retrieves GHN order detail information by ID.
     *
     * @param id   the ID of the order
     * @param user the authenticated user
     * @return the {@link GHNOrderDetail} object
     */
    GHNOrderDetail getGHNOrderDetail(Long id,
            Account user);

    /**
     * Calculates order totals and discounts.
     *
     * @param request the calculation request
     * @param user    the authenticated user
     * @return the {@link CalculateDTO} containing calculation results
     */
    CalculateDTO calculate(CalculateRequest request, Account user);

    /**
     * Processes the checkout for an order.
     *
     * @param checkRequest the order request
     * @param request      the HTTP request
     * @param user         the authenticated user
     * @return the {@link CreatePaymentLinkResponse} containing payment link details
     */
    CreatePaymentLinkResponse checkout(OrderRequest checkRequest,
            HttpServletRequest request,
            Account user);

    /**
     * Creates a payment link for an order.
     *
     * @param request the HTTP request
     * @param id      the order ID
     * @return the {@link CreatePaymentLinkResponse} containing payment link details
     */
    PaymentInfo createPaymentLink(HttpServletRequest request,
            Long id);

    /**
     * Retrieves payment link data for an order.
     *
     * @param id the order ID
     * @return the {@link PaymentLink} containing payment link details
     */
    PaymentLink getPaymentLinkData(Long id);

    /**
     * Cancels an order.
     *
     * @param id     the ID of the order to cancel
     * @param reason the reason for cancellation
     * @param user   the authenticated user
     */
    void cancel(Long id,
            String reason,
            Account user);

    /**
     * Cancels an unpaid order.
     *
     * @param orderId the ID of the order to cancel
     * @param reason  the reason for cancellation
     * @param user    the authenticated user
     */
    void cancelUnpaidOrder(Long orderId,
            String reason,
            Account user);

    /**
     * Changes the payment method for an order.
     *
     * @param orderId       the ID of the order
     * @param paymentMethod the new payment method
     * @param user          the authenticated user
     */
    void changePaymentMethod(Long orderId,
            PaymentType paymentMethod,
            Account user);

    /**
     * Processes a refund for an order.
     *
     * @param id     the ID of the order to refund
     * @param reason the reason for refund
     * @param user   the authenticated user
     */
    void refund(Long id,
            String reason,
            Account user);

    /**
     * Confirms an order.
     *
     * @param id   the ID of the order to confirm
     * @param user the authenticated user
     */
    void confirm(Long id,
            Account user);

    /**
     * Requests a return for an order detail (per-shop shipment).
     *
     * @param id     the OrderDetail id
     * @param reason return reason
     * @param user   current user
     */
    void requestReturn(Long id,
            String reason,
            Account user);

    /**
     * Updates shipping note for a GHN order (seller action).
     *
     * @param id   the OrderDetail id
     * @param note the shipping note
     * @param user current seller
     */
    void updateShippingNote(Long id,
            String note,
            Account user);

    /**
     * Changes the status of an order.
     *
     * @param id     the ID of the order
     * @param status the new order status
     * @param user   the authenticated user
     */
    void changeStatus(Long id,
            OrderStatus status,
            Account user);

    /**
     * Retrieves sales data.
     *
     * @param user      the authenticated user
     * @param shopId    the shop ID for sales
     * @param bookId    the book ID for sales
     * @param startDate the start date of the sales range (inclusive)
     * @param endDate   the end date of the sales range (inclusive)
     * @return a {@link SalesInfoDTO} object containing sales data
     */
    SalesInfoDTO getSales(Account user, Long shopId, Long bookId, LocalDate startDate, LocalDate endDate);
}