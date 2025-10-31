package com.ring.service;

import com.ring.base.AbstractServiceTest;
import com.ring.dto.projection.coupons.ICoupon;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.dto.request.CartStateRequest;
import com.ring.dto.request.CouponRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.coupons.CouponDTO;
import com.ring.dto.response.coupons.CouponDetailDTO;
import com.ring.dto.response.coupons.CouponDiscountDTO;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.CouponMapper;
import com.ring.mapper.DashboardMapper;
import com.ring.model.entity.*;
import com.ring.model.enums.CouponCriteria;
import com.ring.model.enums.CouponType;
import com.ring.model.enums.UserRole;
import com.ring.repository.CouponDetailRepository;
import com.ring.repository.CouponRepository;
import com.ring.repository.ShopRepository;
import com.ring.service.impl.CouponServiceImpl;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class CouponServiceTest extends AbstractServiceTest {

        @Mock
        private CouponRepository couponRepo;

        @Mock
        private CouponDetailRepository couponDetailRepo;

        @Mock
        private ShopRepository shopRepo;

        @Mock
        private CouponMapper couponMapper;

        @Mock
        private DashboardMapper dashMapper;

        @Mock
        private SecurityContext securityContext;

        @Mock
        private Authentication authentication;

        @InjectMocks
        private CouponServiceImpl couponService;

        private final Role role = Role.builder()
                        .roleName(UserRole.ROLE_ADMIN)
                        .build();
        private Account account = Account.builder().id(1L).roles(List.of(role)).build();
        private final Shop shop = Shop.builder()
                        .id(1L)
                        .owner(account)
                        .build();
        private final CouponDetail couponDetail = CouponDetail.builder()
                        .id(1L)
                        .type(CouponType.PRODUCT)
                        .usage((short) 10)
                        .expDate(LocalDate.now().plusDays(30))
                        .attribute(100.0)
                        .discount(BigDecimal.valueOf(0.1))
                        .maxDiscount(50.0)
                        .build();
        private final Coupon coupon = Coupon.builder()
                        .id(1L)
                        .code("TEST123")
                        .shop(shop)
                        .detail(couponDetail)
                        .build();
        private final CouponRequest request = CouponRequest.builder()
                        .code("TEST123")
                        .type(CouponType.PRODUCT)
                        .usage((short) 10)
                        .expireDate(LocalDate.now().plusDays(30))
                        .attribute(100.0)
                        .discount(BigDecimal.valueOf(0.1))
                        .maxDiscount(50.0)
                        .shopId(1L)
                        .build();
        private final CartStateRequest cartState = CartStateRequest.builder()
                        .value(200.0)
                        .quantity(5)
                        .shopId(1L)
                        .shippingFee(100.0)
                        .build();

        @Test
        public void whenGetCoupons_ThenReturnsPage() {

                // Given
                Pageable pageable = PageRequest.of(0, 10, Sort.by("id").descending());
                ICoupon projection = mock(ICoupon.class);
                Page<ICoupon> page = new PageImpl<>(List.of(projection), pageable, 1);
                PagingResponse<CouponDTO> expectedDTOS = new PagingResponse<>(
                                List.of(mock(CouponDTO.class)),
                                1,
                                1L,
                                10,
                                0,
                                false);

                // When
                when(couponRepo.findCoupons(anyList(),
                                anyList(),
                                anyList(),
                                anyString(),
                                anyLong(),
                                anyLong(),
                                anyBoolean(),
                                anyBoolean(),
                                any(Pageable.class)))
                                .thenReturn(page);
                when(projection.getCoupon()).thenReturn(coupon);
                when(couponMapper.couponToDTO(projection)).thenReturn(mock(CouponDTO.class));

                // Then
                PagingResponse<CouponDTO> result = couponService.getCoupons(0,
                                10,
                                "id",
                                "desc",
                                List.of(CouponType.PRODUCT),
                                List.of(CouponCriteria.QUANTITY),
                                List.of("TEST123"),
                                "TEST123",
                                1L,
                                1L,
                                true,
                                false,
                                200.0,
                                5);

                assertNotNull(result);
                assertEquals(expectedDTOS.getPage(), result.getPage());
                assertEquals(expectedDTOS.getSize(), result.getSize());
                assertEquals(expectedDTOS.getTotalElements(), result.getTotalElements());

                // Verify
                verify(couponRepo, times(1)).findCoupons(anyList(),
                                anyList(),
                                anyList(),
                                anyString(),
                                anyLong(),
                                anyLong(),
                                anyBoolean(),
                                anyBoolean(),
                                any(Pageable.class));
                verify(couponMapper, times(1)).couponToDTO(any(ICoupon.class));
        }

        @Test
        public void whenGetCoupon_ThenReturnsDetailDTO() {

                // Given
                ICoupon projection = mock(ICoupon.class);
                CouponDetailDTO expected = mock(CouponDetailDTO.class);

                // When
                when(couponRepo.findCouponById(anyLong())).thenReturn(Optional.of(projection));
                when(couponMapper.couponToDetailDTO(projection)).thenReturn(expected);

                // Then
                CouponDetailDTO result = couponService.getCoupon(1L);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(couponRepo, times(1)).findCouponById(anyLong());
                verify(couponMapper, times(1)).couponToDetailDTO(projection);
        }

        @Test
        public void whenGetNonExistingCoupon_ThenThrowsException() {

                // When
                when(couponRepo.findCouponById(anyLong())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> couponService.getCoupon(1L));
                assertEquals("Coupon not found!", exception.getError());

                // Verify
                verify(couponRepo, times(1)).findCouponById(anyLong());
                verify(couponMapper, never()).couponToDetailDTO(any(ICoupon.class));
        }

        @Test
        public void whenGetCouponByCode_ThenReturnsDTO() {

                // Given
                ICoupon projection = mock(ICoupon.class);
                CouponDTO expected = mock(CouponDTO.class);

                // When
                when(couponRepo.findCouponByCode(anyString())).thenReturn(Optional.of(projection));
                when(projection.getCoupon()).thenReturn(coupon);
                when(couponMapper.couponToDTO(projection)).thenReturn(expected);

                // Then
                CouponDTO result = couponService.getCouponByCode("TEST123", 1L, 200.0, 5);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(couponRepo, times(1)).findCouponByCode(anyString());
                verify(couponMapper, times(1)).couponToDTO(projection);
        }

        @Test
        public void whenGetNonExistingCouponByCode_ThenThrowsException() {

                // When
                when(couponRepo.findCouponByCode(anyString())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> couponService.getCouponByCode("TEST123", 1L, 200.0, 5));
                assertEquals("Coupon not found!", exception.getError());

                // Verify
                verify(couponRepo, times(1)).findCouponByCode(anyString());
                verify(couponMapper, never()).couponToDTO(any(ICoupon.class));
        }

        @Test
        public void whenRecommendCoupons_ThenReturnsList() {

                // Given
                List<ICoupon> projections = List.of(mock(ICoupon.class));
                List<CouponDTO> expected = List.of(mock(CouponDTO.class));

                // When
                when(couponRepo.recommendCoupons(anyList())).thenReturn(projections);
                when(couponMapper.couponToDTO(any(ICoupon.class))).thenReturn(mock(CouponDTO.class));

                // Then
                List<CouponDTO> result = couponService.recommendCoupons(List.of(1L));

                assertNotNull(result);
                assertEquals(expected.size(), result.size());

                // Verify
                verify(couponRepo, times(1)).recommendCoupons(anyList());
                verify(couponMapper, times(1)).couponToDTO(any(ICoupon.class));
        }

        @Test
        public void whenRecommendCoupon_ThenReturnsDTO() {

                // Given
                ICoupon projection = mock(ICoupon.class);
                CouponDTO expected = mock(CouponDTO.class);

                // When
                when(couponRepo.recommendCoupon(anyLong(), anyDouble(), anyInt())).thenReturn(Optional.of(projection));
                when(couponMapper.couponToDTO(projection)).thenReturn(expected);

                // Then
                CouponDTO result = couponService.recommendCoupon(1L, cartState);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(couponRepo, times(1)).recommendCoupon(anyLong(), anyDouble(), anyInt());
                verify(couponMapper, times(1)).couponToDTO(projection);
        }

        @Test
        public void whenGetAnalytics_ThenReturnsStatDTO() {

                // Given
                setupSecurityContext(account);
                StatDTO expected = mock(StatDTO.class);

                // When
                when(couponRepo.getCouponAnalytics(anyLong(), anyLong())).thenReturn(mock(IStat.class));
                when(dashMapper.statToDTO(any(IStat.class), anyString(), anyString())).thenReturn(expected);

                // Then
                StatDTO result = couponService.getAnalytics(1L, 1L, account);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(couponRepo, times(1)).getCouponAnalytics(anyLong(), anyLong());
                verify(dashMapper, times(1)).statToDTO(any(IStat.class), anyString(), anyString());
        }

        @Test
        public void givenNewCoupon_whenAddCoupon_ThenReturnsNewCoupon() {

                // Given
                setupSecurityContext(account);

                // When
                when(shopRepo.findById(anyLong())).thenReturn(Optional.of(shop));
                when(couponRepo.save(any(Coupon.class))).thenReturn(coupon);
                when(couponDetailRepo.save(any(CouponDetail.class))).thenReturn(couponDetail);

                // Then
                Coupon result = couponService.addCoupon(request, account);

                assertNotNull(result);
                assertEquals(coupon, result);

                // Verify
                verify(shopRepo, times(1)).findById(anyLong());
                verify(couponRepo, times(1)).save(any(Coupon.class));
                verify(couponDetailRepo, times(1)).save(any(CouponDetail.class));
        }

        @Test
        public void givenNewCouponForNonExistingShop_whenAddCoupon_ThenThrowsException() {

                // When
                when(shopRepo.findById(anyLong())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> couponService.addCoupon(request, account));
                assertEquals("Shop not found!", exception.getError());

                // Verify
                verify(shopRepo, times(1)).findById(anyLong());
                verify(couponRepo, never()).save(any(Coupon.class));
                verify(couponDetailRepo, never()).save(any(CouponDetail.class));
        }

        @Test
        public void givenNewCouponForSomeoneElseShop_whenAddCoupon_ThenThrowsException() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                when(shopRepo.findById(anyLong())).thenReturn(Optional.of(shop));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> couponService.addCoupon(request, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(shopRepo, times(1)).findById(anyLong());
                verify(couponRepo, never()).save(any(Coupon.class));
                verify(couponDetailRepo, never()).save(any(CouponDetail.class));
        }

        @Test
        public void givenNewGlobalCouponByShopOwner_whenAddCoupon_ThenThrowsException() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // Then
                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> couponService.addCoupon(CouponRequest.builder().shopId(null).build(),
                                                altAccount));
                assertEquals("Shop is required!", exception.getError());

                // Verify
                verify(shopRepo, never()).findById(anyLong());
                verify(couponRepo, never()).save(any(Coupon.class));
                verify(couponDetailRepo, never()).save(any(CouponDetail.class));
        }

        @Test
        public void whenUpdateCoupon_ThenReturnsUpdatedCoupon() {

                // Given
                setupSecurityContext(account);
                Long id = 1L;

                // When
                when(couponRepo.findById(id)).thenReturn(Optional.of(coupon));
                when(shopRepo.findById(anyLong())).thenReturn(Optional.of(shop));
                when(couponDetailRepo.save(any(CouponDetail.class))).thenReturn(couponDetail);
                when(couponRepo.save(any(Coupon.class))).thenReturn(coupon);

                // Then
                Coupon result = couponService.updateCoupon(id, request, account);

                assertNotNull(result);
                assertEquals(coupon, result);

                // Verify
                verify(couponRepo, times(1)).findById(id);
                verify(shopRepo, times(1)).findById(anyLong());
                verify(couponDetailRepo, times(1)).save(any(CouponDetail.class));
                verify(couponRepo, times(1)).save(any(Coupon.class));
        }

        @Test
        public void whenUpdateNonExistingCoupon_ThenThrowsException() {

                // Given
                Long id = 1L;

                // When
                when(couponRepo.findById(id)).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> couponService.updateCoupon(id, request, account));
                assertEquals("Coupon not found!", exception.getError());

                // Verify
                verify(couponRepo, times(1)).findById(id);
                verify(shopRepo, never()).findById(anyLong());
                verify(couponDetailRepo, never()).save(any(CouponDetail.class));
                verify(couponRepo, never()).save(any(Coupon.class));
        }

        @Test
        public void whenUpdateSomeoneElseCoupon_ThenThrowsException() {

                // Given
                Long id = 1L;
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                when(couponRepo.findById(id)).thenReturn(Optional.of(coupon));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> couponService.updateCoupon(id, request, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(couponRepo, times(1)).findById(id);
                verify(shopRepo, never()).findById(anyLong());
                verify(couponDetailRepo, never()).save(any(CouponDetail.class));
                verify(couponRepo, never()).save(any(Coupon.class));
        }

        @Test
        public void whenUpdateCouponToNonExistingShop_ThenThrowsException() {

                // Given
                setupSecurityContext(account);
                Long id = 1L;

                // When
                when(couponRepo.findById(id)).thenReturn(Optional.of(coupon));
                when(shopRepo.findById(anyLong())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> couponService.updateCoupon(id, request, account));
                assertEquals("Shop not found!", exception.getError());

                // Verify
                verify(couponRepo, times(1)).findById(id);
                verify(shopRepo, times(1)).findById(anyLong());
                verify(couponDetailRepo, never()).save(any(CouponDetail.class));
                verify(couponRepo, never()).save(any(Coupon.class));
        }

        @Test
        public void whenUpdateCouponToSomeoneElseShop_ThenThrowsException() {

                // Given
                Long id = 1L;
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);
                Shop altShop = Shop.builder().id(2L).owner(altAccount).build();
                Coupon altCoupon = Coupon.builder().id(id).shop(altShop).build();

                // When
                when(couponRepo.findById(id)).thenReturn(Optional.of(altCoupon));
                when(shopRepo.findById(anyLong())).thenReturn(Optional.of(shop));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> couponService.updateCoupon(id, request, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(couponRepo, times(1)).findById(id);
                verify(shopRepo, times(1)).findById(anyLong());
                verify(couponDetailRepo, never()).save(any(CouponDetail.class));
                verify(couponRepo, never()).save(any(Coupon.class));
        }

        @Test
        public void whenUpdateToGlobalCouponAsSeller_ThenThrowsException() {

                // Given
                Long id = 1L;
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);
                Shop altShop = Shop.builder().id(2L).owner(altAccount).build();
                Coupon altCoupon = Coupon.builder().id(id).shop(altShop).build();
                CouponRequest req = CouponRequest.builder().shopId(null).build();

                // When
                when(couponRepo.findById(id)).thenReturn(Optional.of(altCoupon));

                // Then
                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> couponService.updateCoupon(id, req, altAccount));
                assertEquals("Shop is required!", exception.getError());

                // Verify
                verify(couponRepo, times(1)).findById(id);
                verify(shopRepo, never()).findById(anyLong());
                verify(couponDetailRepo, never()).save(any(CouponDetail.class));
                verify(couponRepo, never()).save(any(Coupon.class));
        }

        @Test
        public void whenDeleteCoupon_ThenReturnsDeletedCoupon() {

                // Given
                setupSecurityContext(account);
                Long id = 1L;

                // When
                when(couponRepo.findById(id)).thenReturn(Optional.of(coupon));
                doNothing().when(couponRepo).deleteById(id);

                // Then
                Coupon result = couponService.deleteCoupon(id, account);

                assertNotNull(result);
                assertEquals(coupon, result);

                // Verify
                verify(couponRepo, times(1)).findById(id);
                verify(couponRepo, times(1)).deleteById(id);

        }

        @Test
        public void whenDeleteNonExistingCoupon_ThenThrowsException() {

                // Given
                Long id = 1L;

                // When
                when(couponRepo.findById(id)).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> couponService.deleteCoupon(id, account));
                assertEquals("Coupon not found!", exception.getError());

                // Verify
                verify(couponRepo, times(1)).findById(id);
                verify(couponRepo, never()).deleteById(id);
        }

        @Test
        public void whenDeleteSomeoneElseCoupon_ThenThrowsException() {

                // Given
                Long id = 1L;
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                when(couponRepo.findById(id)).thenReturn(Optional.of(coupon));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> couponService.deleteCoupon(id, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(couponRepo, times(1)).findById(id);
                verify(couponRepo, never()).deleteById(id);
        }

        @Test
        public void whenDeleteCouponsAsAdmin_ThenSuccess() {

                // Given
                setupSecurityContext(account);
                List<Long> ids = List.of(1L, 2L);

                // When
                doNothing().when(couponRepo).deleteAllById(ids);

                // Then
                couponService.deleteCoupons(ids, account);

                // Verify
                verify(couponRepo, times(1)).deleteAllById(ids);
        }

        @Test
        public void whenDeleteCouponsAsSeller_ThenSuccess() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);
                List<Long> ids = List.of(1L, 2L);

                // When
                when(couponRepo.findCouponIdsByInIdsAndSeller(ids, account.getId())).thenReturn(ids);
                doNothing().when(couponRepo).deleteAllById(ids);

                // Then
                couponService.deleteCoupons(ids, account);

                // Verify
                verify(couponRepo, times(1)).findCouponIdsByInIdsAndSeller(ids, account.getId());
                verify(couponRepo, times(1)).deleteAllById(ids);
        }

        @Test
        public void whenDeleteCouponsInverse_ThenSuccess() {

                // Given
                setupSecurityContext(account);
                List<Long> ids = List.of(1L, 2L);

                // When
                when(couponRepo.findInverseIds(anyList(),
                                anyList(),
                                anyList(),
                                anyString(),
                                anyLong(),
                                anyLong(),
                                anyBoolean(),
                                anyBoolean(),
                                anyList())).thenReturn(ids);
                doNothing().when(couponRepo).deleteAllById(ids);

                // Then
                couponService.deleteCouponsInverse(List.of(CouponType.PRODUCT),
                                List.of(CouponCriteria.QUANTITY),
                                List.of("TEST123"),
                                "TEST123",
                                1L,
                                1L,
                                true,
                                true,
                                ids,
                                account);

                // Verify
                verify(couponRepo, times(1)).findInverseIds(anyList(),
                                anyList(),
                                anyList(),
                                anyString(),
                                anyLong(),
                                anyLong(),
                                anyBoolean(),
                                anyBoolean(),
                                anyList());
                verify(couponRepo, times(1)).deleteAllById(ids);
        }

        @Test
        public void whenDeleteAllCoupons_ThenSuccess() {

                // Given
                setupSecurityContext(account);

                // When
                doNothing().when(couponRepo).deleteAll();

                // Then
                couponService.deleteAllCoupons(null, account);

                // Verify
                verify(couponRepo, times(1)).deleteAll();
        }

        @Test
        public void whenDeleteAllShopCoupons_ThenSuccess() {

                // Given
                setupSecurityContext(account);
                Long id = 1L;

                // When
                doNothing().when(couponRepo).deleteAllByShopId(id);

                // Then
                couponService.deleteAllCoupons(id, account);

                // Verify
                verify(couponRepo, times(1)).deleteAllByShopId(id);
        }

        @Test
        public void whenDeleteAllSellerCoupons_ThenSuccess() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                doNothing().when(couponRepo).deleteAllByShop_Owner(altAccount);

                // Then
                couponService.deleteAllCoupons(null, altAccount);

                // Verify
                verify(couponRepo, times(1)).deleteAllByShop_Owner(altAccount);
        }

        @Test
        public void whenDeleteAllSellerShopCoupons_ThenSuccess() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);
                Long id = 1L;

                // When
                doNothing().when(couponRepo).deleteAllByShopIdAndShop_Owner(id, altAccount);

                // Then
                couponService.deleteAllCoupons(id, altAccount);

                // Verify
                verify(couponRepo, times(1)).deleteAllByShopIdAndShop_Owner(id, altAccount);
        }

        @Test
        public void whenApplyCoupon_ThenReturnsDiscountDTO() {

                // When
                when(couponRepo.hasUserUsedCoupon(anyLong(), anyLong())).thenReturn(false);

                // Then
                CouponDiscountDTO result = couponService.applyCoupon(coupon, cartState, account);

                assertNotNull(result);
                assertTrue(result.discountValue() > 0);

                // Verify
                verify(couponRepo, times(1)).hasUserUsedCoupon(anyLong(), anyLong());
        }

        @Test
        public void whenApplyUsedCoupon_ThenReturnsNull() {

                // Given
                when(couponRepo.hasUserUsedCoupon(anyLong(), anyLong())).thenReturn(true);

                // When
                CouponDiscountDTO result = couponService.applyCoupon(coupon, cartState, account);

                // Then
                assertNull(result);

                // Verify
                verify(couponRepo, times(1)).hasUserUsedCoupon(anyLong(), anyLong());
        }

        @Test
        public void whenIsExpired_ThenReturnsTrue() {

                // Given
                CouponDetail expiredDetail = CouponDetail.builder()
                                .usage((short) 0)
                                .expDate(LocalDate.now().minusDays(1))
                                .build();
                Coupon expiredCoupon = Coupon.builder()
                                .detail(expiredDetail)
                                .build();

                // When
                boolean result = couponService.isExpired(expiredCoupon);

                // Then
                assertTrue(result);
        }

        @Test
        public void whenIsExpired_ThenReturnsFalse() {

                // When
                boolean result = couponService.isExpired(coupon);

                // Then
                assertFalse(result);
        }

        @Test
        public void whenIsUsable_ThenReturnsTrue()
                        throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

                // Given
                Method isUseable = CouponServiceImpl.class.getDeclaredMethod("isUsable", Coupon.class,
                                CartStateRequest.class);
                isUseable.setAccessible(true);

                // Then
                boolean result = (Boolean) isUseable.invoke(couponService, coupon, cartState);

                assertTrue(result);
        }

}