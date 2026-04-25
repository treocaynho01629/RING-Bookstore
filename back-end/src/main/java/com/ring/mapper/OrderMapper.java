package com.ring.mapper;

import com.cloudinary.Cloudinary;
import com.ring.common.AppConstants;
import com.ring.common.CloudinaryTransformations;
import com.ring.dto.projection.orders.*;
import com.ring.dto.response.orders.*;
import com.ring.model.entity.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * A mapper for {@link IOrderReceipt}, {@link IOrder}, {@link IOrderItem},
 * {@link IReceiptDetail}, {@link IOrderSummary},
 * {@link OrderDTO}, {@link OrderDetailDTO}, {@link OrderItemDTO},
 * {@link ReceiptDTO}, {@link OrderSummaryDTO}, {@link SalesInfoDTO}.
 */
@RequiredArgsConstructor
@Service
public class OrderMapper {

    private final Cloudinary cloudinary;

    /**
     * Maps a {@link OrderReceipt} to a {@link ReceiptDTO}.
     * 
     * @param order the order to map
     * @return the mapped {@link ReceiptDTO}
     */
    public ReceiptDTO orderToDTO(OrderReceipt order) {

        List<OrderDetail> orderDetails = order.getDetails();
        List<OrderDTO> detailDTOS = orderDetails.stream()
                .map(this::detailToOrderDTO)
                .collect(Collectors.toList());
        Account user = order.getUser();
        Address address = order.getAddress();

        return new ReceiptDTO(order.getId(),
                order.getEmail(),
                address.getCompanyName() != null ? address.getCompanyName() : address.getName(),
                null,
                address.getPhone(),
                address.getAddress(),
                address.getDetail(),
                order.getLastModifiedDate(),
                order.getTotal(),
                order.getTotalDiscount(),
                user.getUsername(),
                detailDTOS);
    }

    /**
     * Maps a {@link List<IOrderReceipt>} and {@link List<IOrder>} to a
     * {@link List<ReceiptDTO>}.
     * 
     * @param receipts the receipts to map
     * @param details  the details to map
     * @return the mapped {@link List} of {@link ReceiptDTO}
     */
    public List<ReceiptDTO> receiptsToDTOs(List<IOrderReceipt> receipts,
            List<IOrder> details) {

        Map<Long, ReceiptDTO> receiptsMap = new LinkedHashMap<>();

        for (IOrderReceipt receipt : receipts) {

            String imageUrl = receipt.getImage() != null
                    ? cloudinary.url()
                            .transformation(CloudinaryTransformations.SHOP_TRANSFORMATION)
                            .secure(true)
                            .generate(receipt.getImage().getPublicId())
                    : null;

            ReceiptDTO receiptDTO = ReceiptDTO.builder().id(receipt.getId())
                    .email(receipt.getEmail())
                    .name(receipt.getName())
                    .image(imageUrl)
                    .phone(receipt.getPhone())
                    .address(receipt.getAddress())
                    .date(receipt.getDate())
                    .total(receipt.getTotal())
                    .totalDiscount(receipt.getTotalDiscount())
                    .username(receipt.getUsername())
                    .details(new ArrayList<>())
                    .build();

            receiptsMap.put(receipt.getId(), receiptDTO);
        }

        for (IOrder detail : details) {

            // If shop deleted
            Long shopId = detail.getShopId() != null ? detail.getShopId() : -1;

            var newDetail = OrderDTO.builder().id(detail.getId())
                    .orderId(detail.getOrderId())
                    .shopId(shopId)
                    .shopName(detail.getShopName())
                    .totalPrice(detail.getTotalPrice())
                    .totalDiscount(detail.getDiscount())
                    .shippingFee(detail.getShippingFee())
                    .shippingDiscount(detail.getShippingDiscount())
                    .totalItems(detail.getTotalItems())
                    .status(detail.getStatus())
                    .note(detail.getNote())
                    .build();

            receiptsMap.get(detail.getOrderId()).details().add(newDetail);
        }

        // Convert & return
        List<ReceiptDTO> result = new ArrayList<ReceiptDTO>(receiptsMap.values());
        return result;
    }

    /**
     * Maps a {@link OrderDetail} to a {@link OrderDTO}.
     * 
     * @param detail the detail to map
     * @return the mapped {@link OrderDTO}
     */
    public OrderDTO detailToOrderDTO(OrderDetail detail) {

        List<OrderItem> orderItems = detail.getItems();
        List<OrderItemDTO> itemDTOS = orderItems.stream().map(this::itemToDTO).collect(Collectors.toList());
        Shop shop = detail.getShop();

        // If shop deleted
        Long shopId = shop != null ? shop.getId() : -1;
        String shopName = shop != null ? shop.getName() : null;

        return new OrderDTO(detail.getId(),
                detail.getOrder().getId(),
                detail.getOrderCode(),
                detail.getClientOrderCode(),
                shopId,
                null,
                shopName,
                detail.getTotalPrice(),
                detail.getDiscount(),
                detail.getShippingFee(),
                detail.getShippingDiscount(),
                detail.getShippingType(),
                detail.getWeightGrams(),
                detail.getLengthCm(),
                detail.getWidthCm(),
                detail.getHeightCm(),
                detail.getNote(),
                null,
                null,
                detail.getStatus(),
                itemDTOS);
    }

    /**
     * Maps a {@link IOrderDetail} and {@link List<IOrderItem>} to a
     * {@link OrderDetailDTO}.
     * 
     * @param detail the detail to map
     * @param items  the items to map
     * @return the mapped {@link OrderDetailDTO}
     */
    public OrderDetailDTO detailsToDetailDTO(IOrderDetail detail,
            List<IOrderItem> items) {

        // If shop deleted
        Long shopId = detail.getShopId() != null ? detail.getShopId() : -1;

        OrderDetailDTO result = OrderDetailDTO.builder().orderId(detail.getOrderId())
                .name(detail.getCompanyName() != null ? detail.getCompanyName() : detail.getName())
                .phone(detail.getPhone())
                .address(detail.getAddress() + ", " + detail.getDetail())
                .note(detail.getNote())
                .orderedDate(detail.getOrderedDate())
                .paidDate(detail.getPaidDate())
                .date(detail.getDate())
                .id(detail.getId())
                .shopId(shopId)
                .shopName(detail.getShopName())
                .shopVerified(detail.getShopVerified())
                .orderCode(detail.getOrderCode())
                .totalPrice(detail.getTotalPrice())
                .totalDiscount(detail.getDiscount())
                .shippingType(detail.getShippingType())
                .shippingFee(detail.getShippingFee())
                .shippingDiscount(detail.getShippingDiscount())
                .paymentType(detail.getPaymentType())
                .status(detail.getStatus())
                .paymentStatus(detail.getPaymentStatus())
                .items(new ArrayList<>())
                .build();

        for (IOrderItem item : items) {

            String imageUrl = item.getImage() != null
                    ? cloudinary.url().transformation(
                            CloudinaryTransformations.PRODUCT_THUMBNAIL_TRANSFORMATION)
                            .secure(true)
                            .generate(item.getImage().getPublicId())
                    : null;

            // If product deleted
            Long bookId = item.getBookId() != null ? item.getBookId() : -1;

            var newItem = OrderItemDTO.builder().id(item.getId())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .discount(item.getDiscount())
                    .bookId(bookId)
                    .bookTitle(item.getTitle())
                    .bookSlug(item.getSlug())
                    .image(imageUrl)
                    .build();

            result.items().add(newItem);
        }

        return result;
    }

    /**
     * Maps a {@link ICheckoutDetail} and {@link List<OrderDTO>} to a
     * {@link CheckoutDetailDTO}.
     * 
     * @param checkout the checkout to map
     * @param details  the details to map
     * @return the mapped {@link CheckoutDetailDTO}
     */
    public CheckoutDetailDTO checkDetailsToDTO(ICheckoutDetail checkout,
            List<OrderDTO> details) {

        CheckoutDetailDTO result = CheckoutDetailDTO.builder().id(checkout.getId())
                .name(checkout.getCompanyName() != null ? checkout.getCompanyName()
                        : checkout.getName())
                .phone(checkout.getPhone())
                .address(checkout.getAddress() + ", " + checkout.getDetail())
                .orderedDate(checkout.getOrderedDate())
                .date(checkout.getDate())
                .total(checkout.getTotal())
                .totalDiscount(checkout.getTotalDiscount())
                .paymentType(checkout.getPaymentType())
                .paymentStatus(checkout.getPaymentStatus())
                .expiredAt(checkout.getExpiredAt())
                .details(details)
                .build();

        return result;
    }

    /**
     * Maps a {@link List<IOrder>} and {@link List<IOrderItem>} to a
     * {@link List<OrderDTO>}.
     * 
     * @param details the details to map
     * @param items   the items to map
     * @return the mapped {@link List} of {@link OrderDTO}
     */
    public List<OrderDTO> ordersToDTOs(List<IOrder> details, List<IOrderItem> items) {

        Map<Long, OrderDTO> ordersMap = new LinkedHashMap<>();

        for (IOrder detail : details) {
            OrderDTO order = OrderDTO.builder()
                    .id(detail.getId())
                    .orderId(detail.getOrderId())
                    .shopId(detail.getShopId())
                    .shopName(detail.getShopName())
                    .totalPrice(detail.getTotalPrice())
                    .totalDiscount(detail.getDiscount())
                    .shippingFee(detail.getShippingFee())
                    .shippingDiscount(detail.getShippingDiscount())
                    .status(detail.getStatus())
                    .date(detail.getDate())
                    .items(new ArrayList<>())
                    .note(detail.getNote())
                    .build();

            ordersMap.put(detail.getId(), order);
        }

        for (IOrderItem item : items) {

            String imageUrl = item.getImage() != null
                    ? cloudinary.url().transformation(
                            CloudinaryTransformations.PRODUCT_THUMBNAIL_TRANSFORMATION)
                            .secure(true)
                            .generate(item.getImage().getPublicId())
                    : null;

            // If product deleted
            Long bookId = item.getBookId() != null ? item.getBookId() : -1;

            var newItem = OrderItemDTO.builder().id(item.getId())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .discount(item.getDiscount())
                    .bookTitle(item.getTitle())
                    .bookId(bookId)
                    .bookSlug(item.getSlug())
                    .image(imageUrl)
                    .build();

            ordersMap.get(item.getDetailId()).items().add(newItem);
        }

        // Convert & return
        List<OrderDTO> result = new ArrayList<>(ordersMap.values());
        return result;
    }

    /**
     * Maps a {@link OrderItem} to a {@link OrderItemDTO}.
     * 
     * @param item the item to map
     * @return the mapped {@link OrderItemDTO}
     */
    public OrderItemDTO itemToDTO(OrderItem item) {

        Book book = item.getBook();
        String imageUrl = book != null && book.getImage() != null
                ? cloudinary.url().transformation(
                        CloudinaryTransformations.PRODUCT_THUMBNAIL_TRANSFORMATION)
                        .secure(true)
                        .generate(book.getImage().getPublicId())
                : null;

        // If product deleted
        String bookTitle = book != null ? book.getTitle() : null;
        Long bookId = book != null ? book.getId() : -1;
        String bookSlug = book != null ? book.getSlug() : null;

        return new OrderItemDTO(item.getId(),
                item.getPrice(),
                item.getDiscount(),
                item.getQuantity(),
                bookId,
                bookSlug,
                imageUrl,
                bookTitle);
    }

    /**
     * Maps a {@link IOrderSummary} to a {@link OrderSummaryDTO}.
     * 
     * @param projection the projection to map
     * @return the mapped {@link OrderSummaryDTO}
     */
    public OrderSummaryDTO summaryToDTO(IOrderSummary projection) {

        return new OrderSummaryDTO(projection.getId(),
                projection.getName(),
                projection.getDate(),
                projection.getStatus(),
                projection.getTotalPrice(),
                projection.getTotalItems());
    }

    /**
     * Maps a {@link List<Map<String, Object>>} to a {@link SalesInfoDTO}.
     * 
     * @param data the data to map
     * @return the mapped {@link SalesInfoDTO}
     */
    public SalesInfoDTO salesDataToDTO(List<Map<String, Object>> data, LocalDate startDate, LocalDate endDate) {
        Double totalSales = data.stream()
                .map(row -> Double.valueOf(row.get(AppConstants.SALES).toString()))
                .filter(java.util.Objects::nonNull)
                .reduce(0.0, Double::sum);
        List<String> months = new ArrayList<>();
        for (LocalDate date = startDate; date.isBefore(endDate); date = date.plusMonths(1)) {
            months.add(date.format(DateTimeFormatter.ofPattern("yyyy-MM")));
        }
        List<Double> sales = new ArrayList<>();
        for (String month : months) {
            double salesAmount = data.stream()
                    .filter(row -> row.get(AppConstants.NAME).toString().equals(month))
                    .mapToDouble(row -> Double.valueOf(row.get(AppConstants.SALES).toString()))
                    .sum();
            sales.add(salesAmount);
        }

        return new SalesInfoDTO(totalSales,
                months,
                sales);
    }
}
