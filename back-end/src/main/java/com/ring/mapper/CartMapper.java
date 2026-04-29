package com.ring.mapper;

import com.ring.common.FileUploadUtil;
import com.ring.dto.response.cart.CartItemDTO;
import com.ring.model.entity.Book;
import com.ring.model.entity.CartItem;
import com.ring.model.entity.Shop;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.function.Function;

/**
 * A mapper for {@link CartItem}, {@link CartItemDTO}.
 */
@RequiredArgsConstructor
@Service
public class CartMapper implements Function<CartItem, CartItemDTO> {

    private final FileUploadUtil fileUploadUtil;

    /**
     * Maps a {@link CartItem} to a {@link CartItemDTO}.
     * 
     * @param item the cart item to map
     * @return the mapped {@link CartItemDTO}
     */
    @Override
    public CartItemDTO apply(CartItem item) {

        Book product = item.getProduct();
        Shop shop = product != null ? product.getShop() : null;

        // Generate image URL
        String publicId = product != null && product.getImage() != null ? product.getImage().getPublicId() : null;
        String imageUrl = product != null && product.getImage() != null ? product.getImage().getUrl() : null;
        Map<Integer, String> srcSet = fileUploadUtil.generateSrcSet(publicId,
                FileUploadUtil.PRODUCT_SIZES);
        srcSet.put(600, imageUrl);

        return new CartItemDTO(
                product != null ? product.getId() : null,
                item.getUser() != null ? item.getUser().getId() : null,
                shop != null ? shop.getId() : null,
                shop != null ? shop.getName() : null,
                product != null ? product.getId() : null,
                product != null ? product.getSlug() : null,
                srcSet,
                product != null ? product.getTitle() : null,
                product != null ? product.getPrice() : null,
                product != null ? product.getDiscount() : null,
                product != null ? product.getAmount() : null,
                item.getQuantity());
    }
}
