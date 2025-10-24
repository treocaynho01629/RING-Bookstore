package com.ring.mapper;

import com.ring.dto.response.orders.CalculateDTO;
import com.ring.dto.response.orders.CalculateDetailDTO;
import com.ring.dto.response.orders.CalculateItemDTO;
import com.ring.model.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * A mapper for {@link OrderDetail}, {@link OrderItem}, {@link Book}, {@link OrderReceipt} to {@link CalculateDetailDTO}, {@link CalculateItemDTO}, {@link CalculateDTO}.
 */
@RequiredArgsConstructor
@Service
public class CalculateMapper {

    /**
     * Maps a {@link OrderDetail} to a {@link CalculateDetailDTO}.
     * 
     * @param detail the detail to map
     * @return the mapped {@link CalculateDetailDTO}
     */
    public CalculateDetailDTO detailToDTO(OrderDetail detail) {

        List<OrderItem> orderItems = detail.getItems();
        List<CalculateItemDTO> itemDTOS = orderItems.stream().map(this::itemToDTO).collect(Collectors.toList());

        // Shop
        Shop shop = detail.getShop();
        String shopName = (shopName = shop.getName()) != null ? shopName : null;

        return new CalculateDetailDTO(shop.getId(),
                shopName,
                detail.getTotalPrice(),
                detail.getDiscount(),
                detail.getCouponDiscount(),
                detail.getShippingFee(),
                detail.getShippingDiscount(),
                detail.getCouponDTO() != null ? detail.getCouponDTO() : null,
                itemDTOS);
    }

    /**
     * Maps a {@link OrderItem} to a {@link CalculateItemDTO}.
     * 
     * @param item the item to map
     * @return the mapped {@link CalculateItemDTO}
     */
    public CalculateItemDTO itemToDTO(OrderItem item) {

        Book book = item.getBook();
        double price = (price = book.getPrice()) != 0.0 ? price : -1.0;
        short amount = book.getAmount();
        BigDecimal discount = (discount = book.getDiscount()) != null ? discount : null;
        String title = (title = book.getTitle()) != null ? title : null;
        String slug = (slug = book.getSlug()) != null ? slug : null;

        return new CalculateItemDTO(price,
                discount,
                amount,
                item.getQuantity(),
                book.getId(),
                slug,
                title);
    }

    /**
     * Maps a {@link OrderReceipt} to a {@link CalculateDTO}.
     * @param order the order to map
     * @return the mapped {@link CalculateDTO}
     */
    public CalculateDTO orderToDTO(OrderReceipt order) {

        List<OrderDetail> orderDetails = order.getDetails();
        List<CalculateDetailDTO> detailDTOS = orderDetails.stream()
                                        .map(this::detailToDTO)
                                        .collect(Collectors.toList());

        return new CalculateDTO(order.getTotal(),
                order.getProductsPrice(),
                order.getShippingFee(),
                order.getTotalDiscount(),
                order.getDealDiscount(),
                order.getCouponDiscount(),
                order.getShippingDiscount(),
                order.getCouponDTO() != null ? order.getCouponDTO() : null,
                detailDTOS);
    }
}
