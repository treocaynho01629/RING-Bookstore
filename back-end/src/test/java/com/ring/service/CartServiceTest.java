package com.ring.service;

import com.ring.base.AbstractServiceTest;
import com.ring.dto.request.CartDetailRequest;
import com.ring.dto.request.CartItemRequest;
import com.ring.dto.response.cart.CartItemDTO;
import com.ring.exception.HttpResponseException;
import com.ring.model.entity.Account;
import com.ring.model.entity.Book;
import com.ring.model.entity.CartItem;
import com.ring.model.entity.Shop;
import com.ring.repository.BookRepository;
import com.ring.repository.CartItemRepository;
import com.ring.service.impl.CartServiceImpl;
import com.ring.service.impl.MessageService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class CartServiceTest extends AbstractServiceTest {

    @Mock
    private CartItemRepository cartItemRepo;

    @Mock
    private BookRepository bookRepo;

    @Mock
    private MessageService messageService;

    @InjectMocks
    private CartServiceImpl cartService;

    // @Test
    // void buildCartDetailsFromSelectedProductIds_ShouldRejectEmptyIds() {
    //     Account user = Account.builder().id(1L).build();
    //     HttpResponseException ex = assertThrows(HttpResponseException.class,
    //             () -> cartService.buildCartDetailsFromSelectedProductIds(List.of(), null, user));
    //     assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    // }

    // @Test
    // void buildCartDetailsFromSelectedProductIds_ShouldRejectUnownedIds() {
    //     Account user = Account.builder().id(1L).build();
    //     when(cartItemRepo.findAllByUserIdAndProductIdIn(1L, List.of(10L, 11L)))
    //             .thenReturn(List.of());

    //     HttpResponseException ex = assertThrows(HttpResponseException.class,
    //             () -> cartService.buildCartDetailsFromSelectedProductIds(List.of(10L, 11L), null, user));
    //     assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    // }

    // @Test
    // void buildCartDetailsFromSelectedProductIds_ShouldGroupItemsAndApplyMetadata() {
    //     Account user = Account.builder().id(1L).build();
    //     Shop shop = Shop.builder().id(100L).name("Shop A").build();
    //     Book bookA = Book.builder().id(501L).shop(shop).build();
    //     Book bookB = Book.builder().id(502L).shop(shop).build();

    //     CartItem first = CartItem.builder().user(user).product(bookA).quantity((short) 2).build();
    //     CartItem second = CartItem.builder().user(user).product(bookB).quantity((short) 1).build();

    //     when(cartItemRepo.findAllByUserIdAndProductIdIn(1L, List.of(501L, 502L)))
    //             .thenReturn(List.of(first, second));

    //     List<CartDetailRequest> metadata = List.of(
    //             CartDetailRequest.builder()
    //                     .shopId(100L)
    //                     .coupon("SALE100")
    //                     .note("Deliver safely")
    //                     .shippingType(2)
    //                     .items(List.of())
    //                     .build());

    //     List<CartDetailRequest> result = cartService.buildCartDetailsFromSelectedProductIds(
    //             List.of(501L, 502L),
    //             metadata,
    //             user);

    //     assertEquals(1, result.size());
    //     CartDetailRequest detail = result.get(0);
    //     assertEquals(100L, detail.getShopId());
    //     assertEquals("SALE100", detail.getCoupon());
    //     assertEquals("Deliver safely", detail.getNote());
    //     assertEquals(2, detail.getShippingType());
    //     assertEquals(2, detail.getItems().size());

    //     List<CartItemRequest> items = detail.getItems();
    //     assertTrue(items.stream().anyMatch(item -> item.getId().equals(501L) && item.getQuantity() == 2));
    //     assertTrue(items.stream().anyMatch(item -> item.getId().equals(502L) && item.getQuantity() == 1));
    // }

    @Test
    void getMyCart_ShouldDeriveShopFromProduct() {
        Account user = Account.builder().id(1L).build();
        Shop shop = Shop.builder().id(100L).name("Shop A").build();
        Book book = Book.builder()
                .id(501L)
                .title("Book A")
                .slug("book-a")
                .price(100.0)
                .amount((short) 10)
                .shop(shop)
                .build();
        CartItem cartItem = CartItem.builder()
                .user(user)
                .product(book)
                .quantity((short) 2)
                .build();

        when(cartItemRepo.findAllByUserId(1L)).thenReturn(List.of(cartItem));

        List<CartItemDTO> result = cartService.getMyCart(user);

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).shopId());
        assertEquals("Shop A", result.get(0).shopName());
    }
}
