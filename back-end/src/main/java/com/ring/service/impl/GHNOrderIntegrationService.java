package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.dto.projection.books.IBookItem;
import com.ring.dto.request.ghn.GHNCreateOrderRequest;
import com.ring.dto.response.ghn.GHNCreateOrderResponse;
import com.ring.exception.GHNException;
import com.ring.model.entity.Address;
import com.ring.model.entity.OrderDetail;
import com.ring.model.entity.OrderItem;
import com.ring.model.entity.OrderReceipt;
import com.ring.model.enums.PaymentType;
import com.ring.repository.BookRepository;
import com.ring.repository.OrderDetailRepository;
import com.ring.repository.OrderReceiptRepository;
import com.ring.service.GHNService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Creates GHN shipping orders for internal OrderDetails.
 * Kept separate from OrderService/PaymentService to avoid circular dependencies.
 */
@RequiredArgsConstructor
@Service
public class GHNOrderIntegrationService {

    private final OrderReceiptRepository orderRepo;
    private final OrderDetailRepository detailRepo;
    private final BookRepository bookRepo;
    private final GHNService ghnService;

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

    /**
     * Create GHN orders for every OrderDetail within a receipt that doesn't have a GHN order_code yet.
     *
     * @param receiptId receipt id
     * @param paymentType payment type (cash vs online) to decide COD amount
     */
    @Transactional
    public void createGhnOrdersForReceipt(Long receiptId, PaymentType paymentType) {
        OrderReceipt receipt = orderRepo.findById(receiptId).orElse(null);
        if (receipt == null || receipt.getAddress() == null || receipt.getDetails() == null) {
            return;
        }

        Address destination = receipt.getAddress();

        for (OrderDetail detail : receipt.getDetails()) {
            if (detail == null || StringUtils.isNotBlank(detail.getOrderCode())) {
                continue;
            }
            if (detail.getItems() == null || detail.getItems().isEmpty() || detail.getShop() == null
                    || detail.getShop().getAddress() == null) {
                continue;
            }

            GHNCreateOrderRequest request = buildCreateRequest(receipt, detail, destination, paymentType);
            GHNCreateOrderResponse response = ghnService.createOrder(request);

            if (response == null || response.getCode() == null) {
                throw new GHNException(HttpStatus.BAD_GATEWAY, AppConstants.GHN_FAILED, "GHN create order failed");
            }
            if (response.getCode() != HttpStatus.OK.value() || response.getData() == null
                    || StringUtils.isBlank(response.getData().getOrderCode())) {
                throw new GHNException(HttpStatus.valueOf(response.getCode()),
                        AppConstants.GHN_FAILED,
                        response.getMessage());
            }

            detail.setOrderCode(response.getData().getOrderCode());
            detailRepo.save(detail);
        }
    }

    private GHNCreateOrderRequest buildCreateRequest(OrderReceipt receipt,
            OrderDetail detail,
            Address destination,
            PaymentType paymentType) {

        List<Long> bookIds = detail.getItems().stream()
                .map(OrderItem::getBook)
                .filter(b -> b != null && b.getId() != null)
                .map(b -> b.getId())
                .distinct()
                .toList();

        Map<Long, IBookItem> bookItems = bookRepo.findBookItemsInIds(bookIds).stream()
                .collect(Collectors.toMap(IBookItem::getId, Function.identity()));

        int weightGrams = 0;
        int heightCm = 0;
        int lengthCm = 0;
        int widthCm = 0;

        List<GHNCreateOrderRequest.Item> items = new ArrayList<>();
        for (OrderItem oi : detail.getItems()) {
            Long bookId = oi.getBook() != null ? oi.getBook().getId() : null;
            IBookItem bi = bookId != null ? bookItems.get(bookId) : null;

            int q = oi.getQuantity() != null ? oi.getQuantity().intValue() : 0;
            if (bi != null && q > 0) {
                weightGrams += (int) (bi.getWeight() * q);
                heightCm += (int) (bi.getHeight() * q);
                lengthCm = Math.max(lengthCm, (int) bi.getLength());
                widthCm = Math.max(widthCm, (int) bi.getWidth());
            }

            Integer price = oi.getPrice() != null ? (int) Math.floor(oi.getPrice()) : null;
            items.add(GHNCreateOrderRequest.Item.builder()
                    .name(bi != null && bi.getBook() != null ? bi.getBook().getTitle() : "Item")
                    .code(bookId != null ? String.valueOf(bookId) : null)
                    .quantity(q > 0 ? q : 1)
                    .price(price)
                    .weight(bi != null ? (int) bi.getWeight() : null)
                    .length(bi != null ? (int) bi.getLength() : null)
                    .width(bi != null ? (int) bi.getWidth() : null)
                    .height(bi != null ? (int) bi.getHeight() : null)
                    .build());
        }

        weightGrams = weightGrams > 0 ? weightGrams : ghnDefaultWeightGrams;
        lengthCm = lengthCm > 0 ? lengthCm : ghnDefaultLengthCm;
        widthCm = widthCm > 0 ? widthCm : ghnDefaultWidthCm;
        heightCm = heightCm > 0 ? heightCm : ghnDefaultHeightCm;

        int codAmount = 0;
        if (PaymentType.CASH.equals(paymentType)) {
            double product = detail.getTotalPrice() != null ? detail.getTotalPrice() : 0.0;
            double discount = detail.getDiscount() != null ? detail.getDiscount() : 0.0;
            double ship = detail.getShippingFee() != null ? detail.getShippingFee() : 0.0;
            double shipDiscount = detail.getShippingDiscount() != null ? detail.getShippingDiscount() : 0.0;
            codAmount = (int) Math.max(0, Math.floor((product - discount) + (ship - shipDiscount)));
        }

        Integer paymentTypeId = detail.getShippingType(); // expect 1 seller, 2 buyer
        if (paymentTypeId == null || (paymentTypeId != 1 && paymentTypeId != 2)) {
            paymentTypeId = 2;
        }

        String clientOrderCode = "OD-" + detail.getId();
        String toAddress = StringUtils.isNotBlank(destination.getDetail())
                ? destination.getDetail() + ", " + destination.getAddress()
                : destination.getAddress();

        return GHNCreateOrderRequest.builder()
                .paymentTypeId(paymentTypeId)
                .requiredNote("KHONGCHOXEMHANG")
                .clientOrderCode(clientOrderCode)
                .toName(destination.getName())
                .toPhone(destination.getPhone())
                .toAddress(toAddress)
                .toWardCode(destination.getWardCode())
                .toDistrictId(destination.getDistrictId())
                .returnPhone(detail.getShop().getAddress().getPhone())
                .returnAddress(detail.getShop().getAddress().getAddress())
                .returnDistrictId(detail.getShop().getAddress().getDistrictId())
                .returnWardCode(detail.getShop().getAddress().getWardCode())
                .codAmount(codAmount)
                .content("Book order " + receipt.getId())
                .weight(weightGrams)
                .length(lengthCm)
                .width(widthCm)
                .height(heightCm)
                .insuranceValue(0)
                .serviceId(0)
                .serviceTypeId(ghnDefaultServiceTypeId)
                .note(detail.getNote())
                .items(items)
                .build();
    }
}

