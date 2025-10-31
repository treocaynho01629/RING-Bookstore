package com.ring.controller;

import com.ring.config.CurrentAccount;
import com.ring.dto.request.CalculateRequest;
import com.ring.dto.request.OrderRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.orders.*;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.dto.response.dashboard.ChartDTO;
import com.ring.model.entity.Account;
import com.ring.model.enums.OrderStatus;
import com.ring.model.enums.PaymentType;
import com.ring.service.OrderService;
import com.ring.service.impl.MessageService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller named {@link OrderController} for handling order-related
 * operations.
 * Provides endpoints for calculating prices, managing orders,
 * viewing summaries and analytics, and updating order status.
 * Exposes endpoints under "/api/orders".
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final MessageService messageService;
    
    /**
     * Calculates the total price of an order before checkout.
     *
     * @param request  the calculate request with items and options.
     * @param currUser the current authenticated user.
     * @return a DTO containing calculated price details.
     */
    @PostMapping("/calculate")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:order')")
    public ResponseEntity<CalculateDTO> calculate(
            @RequestBody @Valid CalculateRequest request,
            @CurrentAccount Account currUser) {

        CalculateDTO calculateResult = orderService.calculate(request, currUser);
        return new ResponseEntity<>(calculateResult, HttpStatus.OK);
    }

    /**
     * Commits the checkout process and creates an order.
     *
     * @param checkRequest the order request data.
     * @param request      the HTTP servlet request.
     * @param currUser     the current authenticated user.
     * @return a DTO representing the receipt.
     */
    @PostMapping
    @PreAuthorize("hasRole('USER') and hasAuthority('create:order')")
    public ResponseEntity<ReceiptDTO> checkout(
            HttpServletRequest request,
            @RequestBody @Valid OrderRequest checkRequest,
            @CurrentAccount Account currUser) {

        ReceiptDTO result = orderService.checkout(checkRequest, request, currUser);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    /**
     * Gets a paginated list of receipt summaries filtered by shop or book.
     *
     * @param shopId   optional shop ID.
     * @param bookId   optional book ID.
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param sortBy   sorting field.
     * @param sortDir  sorting direction.
     * @param currUser the current authenticated seller.
     * @return a page of receipt summaries.
     */
    @GetMapping("/summaries")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:order')")
    public ResponseEntity<PagingResponse<ReceiptSummaryDTO>> getSummaries(
            @RequestParam(value = "shopId", required = false) Long shopId,
            @RequestParam(value = "bookId", required = false) Long bookId,
            @RequestParam(value = "pSize", defaultValue = "15") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @CurrentAccount Account currUser) {

        PagingResponse<ReceiptSummaryDTO> summaries = orderService.getSummariesWithFilter(currUser,
                shopId,
                bookId,
                pageNo,
                pageSize,
                sortBy,
                sortDir);
        return new ResponseEntity<>(summaries, HttpStatus.OK);
    }

    /**
     * Retrieves all receipts with optional filters.
     *
     * @param shopId   optional shop ID.
     * @param status   order status.
     * @param keyword  keyword to search.
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param sortBy   field to sort by.
     * @param sortDir  sorting direction.
     * @param currUser the current authenticated seller.
     * @return a page of receipt DTOs.
     */
    @GetMapping("/receipts")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:order')")
    public ResponseEntity<PagingResponse<ReceiptDTO>> getAllReceipts(
            @RequestParam(value = "shopId", required = false) Long shopId,
            @RequestParam(value = "status", defaultValue = "") OrderStatus status,
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "pSize", defaultValue = "15") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @CurrentAccount Account currUser) {

        PagingResponse<ReceiptDTO> orders = orderService.getAllReceipts(currUser,
                shopId,
                status,
                keyword,
                pageNo,
                pageSize,
                sortBy,
                sortDir);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    /**
     * Retrieves a single receipt by its ID.
     *
     * @param id the receipt ID.
     * @return the receipt DTO.
     */
    @GetMapping("/receipts/{id}")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:order')")
    public ResponseEntity<ReceiptDTO> getReceipt(
        @PathVariable("id") Long id) {

        ReceiptDTO receipt = orderService.getReceipt(id);
        return new ResponseEntity<>(receipt, HttpStatus.OK);
    }

    @GetMapping("/receipts/detail/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:order')")
    public ResponseEntity<ReceiptDetailDTO> getReceiptDetail(
            @PathVariable("id") Long id,
            @CurrentAccount Account currUser) {

        ReceiptDetailDTO receipt = orderService.getReceiptDetail(id, currUser);
        return new ResponseEntity<>(receipt, HttpStatus.OK);
    }

    /**
     * Retrieves order details for the given order ID.
     *
     * @param id       order ID.
     * @param currUser the current authenticated user.
     * @return order detail DTO.
     */
    @GetMapping("/detail/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:order')")
    public ResponseEntity<OrderDetailDTO> getOrderDetail(
            @PathVariable("id") Long id,
            @CurrentAccount Account currUser) {

        OrderDetailDTO order = orderService.getOrderDetail(id, currUser);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    /**
     * Retrieves paginated list of orders for the current user.
     *
     * @param status   filter by status.
     * @param keyword  search keyword.
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param currUser the current authenticated user.
     * @return a page of order DTOs.
     */
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:order')")
    public ResponseEntity<PagingResponse<OrderDTO>> getOrdersByUser(
            @RequestParam(value = "status", defaultValue = "") OrderStatus status,
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "pSize", defaultValue = "15") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @CurrentAccount Account currUser) {

        PagingResponse<OrderDTO> orders = orderService.getOrdersByUser(currUser,
                status,
                keyword,
                pageNo,
                pageSize);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    /**
     * Retrieves orders for a specific book ID.
     *
     * @param id       book ID.
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param sortBy   field to sort.
     * @param sortDir  sorting direction.
     * @return a page of order DTOs.
     */
    @GetMapping("/book/{id}")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:order')")
    public ResponseEntity<PagingResponse<OrderDTO>> getOrdersByBookId(
            @PathVariable("id") Long id,
            @RequestParam(value = "pSize", defaultValue = "15") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        PagingResponse<OrderDTO> orders = orderService.getOrdersByBookId(id,
                pageNo,
                pageSize,
                sortBy,
                sortDir);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    /**
     * Cancels an order.
     *
     * @param id       order ID.
     * @param reason   cancellation reason.
     * @param currUser current authenticated user.
     * @return confirmation message.
     */
    @PutMapping("/cancel/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('update:order')")
    public ResponseEntity<String> cancelOrder(
            @PathVariable("id") Long id,
            @RequestParam(value = "reason") 
                @NotBlank(message = "{validation.constraints.not.blank}")
                @Size(max = 300, message = "{validation.constraints.size.max}") String reason,
            @CurrentAccount Account currUser) {

        orderService.cancel(id, reason, currUser);
        String message = messageService.getMessage("message.update.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PutMapping("/cancel-unpaid/{orderId}")
    @PreAuthorize("hasRole('USER') and hasAuthority('update:order')")
    public ResponseEntity<String> cancelUnpaidOrders(
            @PathVariable("orderId") Long orderId,
            @RequestParam(value = "reason") 
                @NotBlank(message = "{validation.constraints.not.blank}")
                @Size(max = 300, message = "{validation.constraints.size.max}") String reason,
            @CurrentAccount Account currUser) {

        orderService.cancelUnpaidOrder(orderId, reason, currUser);
        String message = messageService.getMessage("message.update.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PutMapping("/payment/{orderId}")
    @PreAuthorize("hasRole('USER') and hasAuthority('update:order')")
    public ResponseEntity<String> updatePaymentMethod(
            @PathVariable("orderId") Long orderId,
            @RequestParam(value = "paymentMethod") 
                @NotNull(message = "{validation.constraints.not.blank}") PaymentType paymentMethod,
            @CurrentAccount Account currUser) {

        orderService.changePaymentMethod(orderId, paymentMethod, currUser);
        String message = messageService.getMessage("message.update.succeeded");

        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    /**
     * Requests a refund for an order.
     *
     * @param id       order ID.
     * @param reason   reason for refund.
     * @param currUser current authenticated user.
     * @return confirmation message.
     */
    @PutMapping("/refund/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('update:order')")
    public ResponseEntity<String> refundOrder(
            @PathVariable("id") Long id,
            @RequestParam(value = "reason") 
                @NotBlank(message = "{validation.constraints.not.blank}")
                @Size(max = 300, message = "{validation.constraints.size.max}") String reason,
            @CurrentAccount Account currUser) {

        orderService.refund(id, reason, currUser);
        String message = messageService.getMessage("message.update.succeeded");

        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    /**
     * Confirms that the order was received successfully.
     *
     * @param id       order ID.
     * @param currUser current authenticated user.
     * @return confirmation message.
     */
    @PutMapping("/confirm/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('update:order')")
    public ResponseEntity<String> confirmOrder(
            @PathVariable("id") Long id,
            @CurrentAccount Account currUser) {

        orderService.confirm(id, currUser);
        String message = messageService.getMessage("message.update.succeeded");

        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    /**
     * Changes the status of an order.
     *
     * @param id       order ID.
     * @param status   new order status.
     * @param currUser current authenticated seller.
     * @return confirmation message.
     */
    @PutMapping("/status/{id}")
    @PreAuthorize("hasAnyRole('SELLER') and hasAuthority('update:order')")
    public ResponseEntity<String> changeOrderStatus(
            @PathVariable("id") Long id,
            @RequestParam(value = "status", defaultValue =  "COMPLETED") OrderStatus status,
            @CurrentAccount Account currUser) {

        orderService.changeStatus(id, status, currUser);
        String message = messageService.getMessage("message.update.succeeded");
        
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    /**
     * Gets analytics for the current user or specified shop.
     *
     * @param shopId   optional shop ID.
     * @param currUser current authenticated seller.
     * @return analytics data.
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:order')")
    public ResponseEntity<StatDTO> getUserAnalytics(
            @RequestParam(value = "shopId", required = false) Long shopId,
            @CurrentAccount Account currUser) {

        StatDTO analytics = orderService.getAnalytics(currUser, shopId);
        return new ResponseEntity<>(analytics, HttpStatus.CREATED);
    }

    /**
     * Gets monthly sales statistics for charting.
     *
     * @param shopId   optional shop ID.
     * @param year     optional year filter.
     * @param currUser current authenticated seller.
     * @return sales data grouped by month.
     */
    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:order')")
    public ResponseEntity<List<ChartDTO>> getMonthlySales(
            @RequestParam(value = "shopId", required = false) Long shopId,
            @RequestParam(value = "year", required = false) Integer year,
            @CurrentAccount Account currUser) {

        List<ChartDTO> monthlySales = orderService.getMonthlySales(currUser, shopId, year);
        return new ResponseEntity<>(monthlySales, HttpStatus.CREATED);
    }
}
