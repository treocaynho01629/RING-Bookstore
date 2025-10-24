package com.ring.mapper;

import com.cloudinary.Cloudinary;
import com.ring.common.CloudinaryTransformations;
import com.ring.dto.projection.orders.*;
import com.ring.dto.response.orders.*;
import com.ring.model.entity.*;
import com.ring.service.impl.MessageService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * A mapper for {@link IOrderReceipt}, {@link IOrder}, {@link IOrderItem}, {@link IReceiptDetail}, {@link IReceiptSummary}, 
 * {@link OrderDTO}, {@link OrderDetailDTO}, {@link OrderItemDTO}, {@link ReceiptDTO}, {@link ReceiptDetailDTO}, {@link ReceiptSummaryDTO}.
 */
@RequiredArgsConstructor
@Service
public class OrderMapper {

    private final Cloudinary cloudinary;
    private final MessageService messageService;

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

        // If user deleted
        String defaultUser = messageService.getMessage("default.user");
        String username = user != null ? user.getUsername() : defaultUser;
        String email = order.getEmail() != null ? order.getEmail() : defaultUser;

        return new ReceiptDTO(order.getId(),
                email,
                address.getCompanyName() != null ? address.getCompanyName() : address.getName(),
                null,
                address.getPhone(),
                address.getCity() + ", " + address.getAddress(),
                order.getLastModifiedDate(),
                order.getTotal(),
                order.getTotalDiscount(),
                username,
                detailDTOS);
    }

    /**
     * Maps a {@link List<IOrderReceipt>} and {@link List<IOrder>} to a {@link List<ReceiptDTO>}.
     * 
     * @param receipts the receipts to map
     * @param details the details to map
     * @return the mapped {@link List} of {@link ReceiptDTO}
     */
    public List<ReceiptDTO> receiptsAndDetailsProjectionToReceiptDTOS(List<IOrderReceipt> receipts,
            List<IOrder> details) {

        Map<Long, ReceiptDTO> receiptsMap = new LinkedHashMap<>();

        for (IOrderReceipt receipt : receipts) {

            String imageUrl = receipt.getImage() != null
                    ? cloudinary.url()
                        .transformation(CloudinaryTransformations.PRODUCT_TRANSFORMATION)
                        .secure(true)
                        .generate(receipt.getImage().getPublicId())
                    : null;

            // If user deleted
            String defaultUser = messageService.getMessage("default.user");
            String username = receipt.getUsername() != null ? receipt.getUsername() : defaultUser;
            String email = receipt.getEmail() != null ? receipt.getEmail() : defaultUser;

            ReceiptDTO receiptDTO = ReceiptDTO.builder().id(receipt.getId())
                    .email(email)
                    .name(receipt.getName())
                    .image(imageUrl)
                    .phone(receipt.getPhone())
                    .address(receipt.getAddress())
                    .date(receipt.getDate())
                    .total(receipt.getTotal())
                    .totalDiscount(receipt.getTotalDiscount())
                    .username(username)
                    .details(new ArrayList<>())
                    .build();

            receiptsMap.put(receipt.getId(), receiptDTO);
        }

        for (IOrder detail : details) {

            // If shop deleted
            String defaultShop = messageService.getMessage("default.shop");
            String shopName = detail.getShopName() != null ? detail.getShopName() : defaultShop;
            Long shopId = detail.getShopId() != null ? detail.getShopId() : -1;

            var newDetail = OrderDTO.builder().id(detail.getId())
                    .orderId(detail.getOrderId())
                    .shopId(shopId)
                    .shopName(shopName)
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
        String defaultShop = messageService.getMessage("default.shop");
        String shopName = shop != null ? shop.getName() : defaultShop;
        Long shopId = shop != null ? shop.getId() : -1;

        return new OrderDTO(detail.getId(),
                detail.getOrder().getId(),
                shopId,
                shopName,
                detail.getTotalPrice(),
                detail.getDiscount(),
                detail.getShippingFee(),
                detail.getShippingDiscount(),
                detail.getShippingType(),
                detail.getNote(),
                null,
                detail.getStatus(),
                itemDTOS);
    }

    /**
     * Maps a {@link IOrderDetail} and {@link List<IOrderItem>} to a {@link OrderDetailDTO}.
     * 
     * @param detail the detail to map
     * @param items the items to map
     * @return the mapped {@link OrderDetailDTO}
     */
    public OrderDetailDTO orderDetailAndItemsProjectionToOrderDetailDTO(IOrderDetail detail,
            List<IOrderItem> items) {

        // If shop deleted
        String defaultShop = messageService.getMessage("default.shop");
        String shopName = detail.getShopName() != null ? detail.getShopName() : defaultShop;
        Long shopId = detail.getShopId() != null ? detail.getShopId() : -1;

        OrderDetailDTO result = OrderDetailDTO.builder().orderId(detail.getOrderId())
                .name(detail.getCompanyName() != null ? detail.getCompanyName() : detail.getName())
                .phone(detail.getPhone())
                .address(detail.getCity() + ", " + detail.getAddress())
                .note(detail.getNote())
                .orderedDate(detail.getOrderedDate())
                .date(detail.getDate())
                .id(detail.getId())
                .shopId(shopId)
                .shopName(shopName)
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
                    ? cloudinary.url().transformation(CloudinaryTransformations.PRODUCT_TRANSFORMATION)
                            .secure(true)
                            .generate(item.getImage().getPublicId())
                    : null;

            // If product deleted
            String defaultBookTitle = messageService.getMessage("default.product");
            String bookTitle = item.getTitle() != null ? item.getTitle() : defaultBookTitle;
            Long bookId = item.getBookId() != null ? item.getBookId() : -1;
            String bookSlug = item.getSlug() != null ? item.getSlug() : null;

            var newItem = OrderItemDTO.builder().id(item.getId())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .discount(item.getDiscount())
                    .bookId(bookId)
                    .bookTitle(bookTitle)
                    .bookSlug(bookSlug)
                    .image(imageUrl)
                    .build();

            result.items().add(newItem);
        }

        return result;
    }

    /**
     * Maps a {@link IReceiptDetail} and {@link List<OrderDTO>} to a {@link ReceiptDetailDTO}.
     * 
     * @param receipt the receipt to map
     * @param details the details to map
     * @return the mapped {@link ReceiptDetailDTO}
     */
    public ReceiptDetailDTO receiptDetailAndDetailsDTOToReceiptDetailDTO(IReceiptDetail receipt,
            List<OrderDTO> details) {

        ReceiptDetailDTO result = ReceiptDetailDTO.builder().id(receipt.getId())
                .name(receipt.getCompanyName() != null ? receipt.getCompanyName() : receipt.getName())
                .phone(receipt.getPhone())
                .address(receipt.getCity() + ", " + receipt.getAddress())
                .orderedDate(receipt.getOrderedDate())
                .date(receipt.getDate())
                .total(receipt.getTotal())
                .totalDiscount(receipt.getTotalDiscount())
                .paymentType(receipt.getPaymentType())
                .paymentStatus(receipt.getPaymentStatus())
                .expiredAt(receipt.getExpiredAt())
                .details(details)
                .build();

        return result;
    }

    /**
     * Maps a {@link List<IOrder>} and {@link List<IOrderItem>} to a {@link List<OrderDTO>}.
     * 
     * @param details the details to map
     * @param items the items to map
     * @return the mapped {@link List} of {@link OrderDTO}
     */
    public List<OrderDTO> ordersAndItemsProjectionToDTOS(List<IOrder> details, List<IOrderItem> items) {

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
                    .items(new ArrayList<>())
                    .note(detail.getNote())
                    .build();

            ordersMap.put(detail.getId(), order);
        }

        for (IOrderItem item : items) {

            String imageUrl = item.getImage() != null
                    ? cloudinary.url().transformation(CloudinaryTransformations.PRODUCT_TRANSFORMATION)
                            .secure(true)
                            .generate(item.getImage().getPublicId())
                    : null;

            // If product deleted
            String defaultBookTitle = messageService.getMessage("default.product");
            String bookTitle = item.getTitle() != null ? item.getTitle() : defaultBookTitle;
            Long bookId = item.getBookId() != null ? item.getBookId() : -1;
            String bookSlug = item.getSlug() != null ? item.getSlug() : null;

            var newItem = OrderItemDTO.builder().id(item.getId())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .discount(item.getDiscount())
                    .bookTitle(bookTitle)
                    .bookId(bookId)
                    .bookSlug(bookSlug)
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
                ? cloudinary.url().transformation(CloudinaryTransformations.PRODUCT_TRANSFORMATION)
                        .secure(true)
                        .generate(book.getImage().getPublicId())
                : null;

        // If product deleted
        String defaultBookTitle = messageService.getMessage("default.product");
        String bookTitle = book != null ? book.getTitle() : defaultBookTitle;
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
     * Maps a {@link IReceiptSummary} to a {@link ReceiptSummaryDTO}.
     * 
     * @param projection the projection to map
     * @return the mapped {@link ReceiptSummaryDTO}
     */
    public ReceiptSummaryDTO summaryToDTO(IReceiptSummary projection) {

        String imageUrl = projection.getImage() != null 
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.AVATAR_TRANSFORMATION)
                        .secure(true)
                        .generate(projection.getImage().getPublicId())
                : null;

        return new ReceiptSummaryDTO(projection.getId(),
                imageUrl,
                projection.getName(),
                projection.getDate(),
                projection.getTotalPrice(),
                projection.getTotalItems());
    }
}
