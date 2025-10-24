package com.ring.service;

import com.ring.base.AbstractServiceTest;
import com.ring.dto.projection.banners.IBanner;
import com.ring.dto.request.BannerRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.banners.BannerDTO;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.BannerMapper;
import com.ring.model.entity.*;
import com.ring.model.enums.UserRole;
import com.ring.repository.BannerRepository;
import com.ring.repository.ShopRepository;
import com.ring.service.impl.BannerServiceImpl;
import com.ring.common.FileUploadUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class BannerServiceTest extends AbstractServiceTest {

        @Mock
        private BannerRepository bannerRepo;

        @Mock
        private ShopRepository shopRepo;

        @Mock
        private BannerMapper bannerMapper;

        @Mock
        private ImageService imageService;

        @InjectMocks
        private BannerServiceImpl bannerService;

        private final MockMultipartFile file = new MockMultipartFile(
                        "file",
                        "event.png",
                        MediaType.IMAGE_PNG_VALUE,
                        "Hello, World!".getBytes());
        private final Image image = Image.builder().id(1L).name("profile.png").build();
        private final Role role = Role.builder()
                        .roleName(UserRole.ROLE_ADMIN)
                        .build();
        private Account account = Account.builder().id(1L).roles(List.of(role)).build();
        private final Shop shop = Shop.builder().id(1L).owner(account).build();
        private BannerRequest request = BannerRequest.builder()
                        .url("/")
                        .description("test")
                        .name("Test")
                        .shopId(1L)
                        .build();

        @AfterEach
        public void cleanUp() {
                account = Account.builder().id(1L).roles(List.of(role)).build();
                request = BannerRequest.builder()
                                .url("/")
                                .description("test")
                                .name("Test")
                                .shopId(1L)
                                .build();
                SecurityContextHolder.clearContext();
        }

        @Test
        public void whenGetBanners_ThenReturnsPagedBanners() {

                // Given
                Pageable pageable = PageRequest.of(0, 1, Sort.by("id").descending());
                Page<IBanner> banners = new PageImpl<>(
                                List.of(mock(IBanner.class)),
                                pageable,
                                2);
                BannerDTO mapped = BannerDTO.builder().id(1).build();
                PagingResponse<BannerDTO> expectedResponse = new PagingResponse<>(
                                List.of(mapped),
                                2,
                                2L,
                                1,
                                0,
                                false);

                // When
                when(bannerRepo.findBanners(eq(""), isNull(), eq(false), any(Pageable.class))).thenReturn(banners);
                when(bannerMapper.apply(any(IBanner.class))).thenReturn(mapped);

                // Then
                PagingResponse<BannerDTO> result = bannerService.getBanners(pageable.getPageNumber(),
                                pageable.getPageSize(),
                                pageable.getSort().toString(),
                                pageable.getSort().descending().toString(),
                                "",
                                null,
                                false);

                assertNotNull(result);
                assertEquals(expectedResponse.getContent().size(), result.getContent().size());
                assertEquals(expectedResponse.getTotalPages(), result.getTotalPages());
                assertEquals(expectedResponse.getTotalElements(), result.getTotalElements());
                assertEquals(expectedResponse.getSize(), result.getSize());
                assertEquals(expectedResponse.getPage(), result.getPage());
                assertEquals(expectedResponse.isEmpty(), result.isEmpty());

                // Verify
                verify(bannerRepo, times(1)).findBanners(eq(""), isNull(), eq(false), any(Pageable.class));
                verify(bannerMapper, times(1)).apply(any(IBanner.class));
        }

        @Test
        public void givenNewBanner_WhenAddBanner_ThenReturnsNewBanner() {

                // Given
                setupSecurityContext(account);
                Banner expected = Banner.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .url(request.getUrl())
                                .build();

                // When
                when(shopRepo.findById(request.getShopId())).thenReturn(Optional.of(shop));
                when(imageService.upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER))).thenReturn(image);
                when(bannerRepo.save(any(Banner.class))).thenReturn(expected);

                // Then
                Banner result = bannerService.addBanner(request, file, account);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(shopRepo, times(1)).findById(request.getShopId());
                verify(imageService, times(1)).upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER));
                verify(bannerRepo, times(1)).save(any(Banner.class));
        }

        @Test
        public void givenNewBannerWithNonExistingShop_WhenAddBanner_ThenThrowsException() {

                // Given
                request.setShopId(2L);

                // When
                when(shopRepo.findById(request.getShopId())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bannerService.addBanner(request, file, account));
                assertEquals("Shop not found!", exception.getError());

                // Verify
                verify(shopRepo, times(1)).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER));
                verify(bannerRepo, never()).save(any(Banner.class));
        }

        @Test
        public void givenNewBannerForSomeoneElseShop_WhenAddBanner_ThenThrowsException() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                when(shopRepo.findById(request.getShopId())).thenReturn(Optional.of(shop));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> bannerService.addBanner(request, file, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(shopRepo, times(1)).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER));
                verify(bannerRepo, never()).save(any(Banner.class));
        }

        @Test
        public void givenNewGlobalBannerByShopOwner_WhenAddBanner_ThenThrowsException() {

                // Given
                request.setShopId(null);
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // Then
                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> bannerService.addBanner(request, file, altAccount));
                assertEquals("Shop is required!", exception.getError());

                // Verify
                verify(shopRepo, never()).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER));
                verify(bannerRepo, never()).save(any(Banner.class));
        }

        @Test
        public void whenUpdateBanner_ThenReturnsNewBanner() {

                // Given
                setupSecurityContext(account);
                Integer id = 1;
                Banner expected = Banner.builder()
                                .id(1)
                                .name(request.getName())
                                .description(request.getDescription())
                                .url(request.getUrl())
                                .shop(shop)
                                .build();

                // When
                when(bannerRepo.findById(id)).thenReturn(Optional.of(expected));
                when(shopRepo.findById(request.getShopId())).thenReturn(Optional.of(shop));
                when(imageService.upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER))).thenReturn(image);
                when(bannerRepo.save(any(Banner.class))).thenReturn(expected);

                // Then
                Banner result = bannerService.updateBanner(id, request, file, account);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(bannerRepo, times(1)).findById(id);
                verify(shopRepo, times(1)).findById(request.getShopId());
                verify(imageService, times(1)).upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER));
                verify(bannerRepo, times(1)).save(any(Banner.class));
        }

        @Test
        public void whenUpdateBannerWithNonExistingShop_ThenThrowsException() {

                // Given
                setupSecurityContext(account);
                Integer id = 1;
                request.setShopId(2L);
                Banner expected = Banner.builder()
                                .id(1)
                                .name(request.getName())
                                .description(request.getDescription())
                                .url(request.getUrl())
                                .shop(shop)
                                .build();

                // When
                when(bannerRepo.findById(id)).thenReturn(Optional.of(expected));
                when(shopRepo.findById(request.getShopId())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bannerService.updateBanner(id, request, file, account));
                assertEquals("Shop not found!", exception.getError());

                // Verify
                verify(bannerRepo, times(1)).findById(id);
                verify(shopRepo, times(1)).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER));
                verify(bannerRepo, never()).save(any(Banner.class));
        }

        @Test
        public void whenUpdateBannerOfSomeoneElseShop_ThenThrowsException() {

                // Given
                Integer id = 1;
                Banner expected = Banner.builder()
                                .id(1)
                                .name(request.getName())
                                .description(request.getDescription())
                                .url(request.getUrl())
                                .shop(shop)
                                .build();
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                when(bannerRepo.findById(id)).thenReturn(Optional.of(expected));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> bannerService.updateBanner(id, request, file, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(bannerRepo, times(1)).findById(id);
                verify(shopRepo, never()).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER));
                verify(bannerRepo, never()).save(any(Banner.class));
        }

        @Test
        public void whenUpdateBannerToSomeoneElseShop_ThenThrowsException() {

                // Given
                Integer id = 1;
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                Shop altShop = Shop.builder().id(2L).owner(altAccount).build();
                Banner expected = Banner.builder()
                                .id(1)
                                .name(request.getName())
                                .description(request.getDescription())
                                .url(request.getUrl())
                                .shop(altShop)
                                .build();
                SecurityContextHolder.clearContext();
                setupSecurityContext(altAccount);

                // When
                when(bannerRepo.findById(id)).thenReturn(Optional.of(expected));
                when(shopRepo.findById(request.getShopId())).thenReturn(Optional.of(shop));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> bannerService.updateBanner(id, request, file, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(bannerRepo, times(1)).findById(id);
                verify(shopRepo, times(1)).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER));
                verify(bannerRepo, never()).save(any(Banner.class));
        }

        @Test
        public void whenUpdateToGlobalBannerAsSeller_ThenThrowsException() {

                // Given
                Integer id = 1;
                request.setShopId(null);
                Banner expected = Banner.builder()
                                .id(1)
                                .name(request.getName())
                                .description(request.getDescription())
                                .url(request.getUrl())
                                .shop(shop)
                                .build();
                account.setRoles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()));
                SecurityContextHolder.clearContext();
                setupSecurityContext(account);

                // When
                when(bannerRepo.findById(id)).thenReturn(Optional.of(expected));

                // Then
                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> bannerService.updateBanner(id, request, file, account));
                assertEquals("Shop is required!", exception.getError());

                // Verify
                verify(bannerRepo, times(1)).findById(id);
                verify(shopRepo, never()).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.BANNER_FOLDER));
                verify(bannerRepo, never()).save(any(Banner.class));
        }

        @Test
        public void whenDeleteBanner_ThenReturnDeletedBanner() {

                // Given
                setupSecurityContext(account);
                Integer id = 1;
                Banner expected = Banner.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .url(request.getUrl())
                                .build();

                // When
                when(bannerRepo.findById(id)).thenReturn(Optional.of(expected));
                doNothing().when(bannerRepo).deleteById(id);

                // Then
                Banner result = bannerService.deleteBanner(id, account);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(bannerRepo, times(1)).findById(id);
                verify(bannerRepo, times(1)).deleteById(id);
        }

        @Test
        public void whenDeleteSomeoneElseBanner_ThenThrowsException() {

                // Given
                Integer id = 1;
                Banner expected = Banner.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .url(request.getUrl())
                                .shop(shop)
                                .build();
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                when(bannerRepo.findById(id)).thenReturn(Optional.of(expected));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> bannerService.deleteBanner(id, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(bannerRepo, times(1)).findById(id);
                verify(bannerRepo, never()).deleteById(id);
        }

        @Test
        public void whenDeleteBannersAsAdmin_ThenSuccess() {

                // Given
                setupSecurityContext(account);
                List<Integer> ids = List.of(1, 2, 3);

                // When
                doNothing().when(bannerRepo).deleteAllById(ids);

                // Then
                bannerService.deleteBanners(ids, account);

                // Verify
                verify(bannerRepo, times(1)).deleteAllById(ids);
        }

        @Test
        public void whenDeleteBannersAsSeller_ThenSuccess() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);
                List<Integer> ids = List.of(1, 2, 3);

                // When
                when(bannerRepo.findBannerIdsByInIdsAndOwner(ids, altAccount.getId())).thenReturn(ids);
                doNothing().when(bannerRepo).deleteAllById(ids);

                // Then
                bannerService.deleteBanners(ids, altAccount);

                // Verify
                verify(bannerRepo, times(1)).findBannerIdsByInIdsAndOwner(ids, altAccount.getId());
                verify(bannerRepo, times(1)).deleteAllById(ids);
        }

        @Test
        public void whenDeleteBannersInverse_ThenSuccess() {

                // Given
                setupSecurityContext(account);
                List<Integer> ids = List.of(1, 2, 3);
                List<Integer> inverseIds = List.of(4);

                // When
                when(bannerRepo.findInverseIds("", null, false, null, ids)).thenReturn(inverseIds);
                doNothing().when(bannerRepo).deleteAllById(inverseIds);

                // Then
                bannerService.deleteBannersInverse("", null, false, ids, account);

                // Verify
                verify(bannerRepo, times(1)).findInverseIds("", null, false, null, ids);
                verify(bannerRepo, times(1)).deleteAllById(inverseIds);
        }

        @Test
        void whenDeleteAllBanners_ThenSuccess() {

                // Given
                setupSecurityContext(account);

                // When
                doNothing().when(bannerRepo).deleteAll();

                // Then
                bannerService.deleteAllBanners(null, account);

                // Verify
                verify(bannerRepo, times(1)).deleteAll();
        }

        @Test
        public void whenDeleteAllShopBanners_ThenSuccess() {

                // Given
                setupSecurityContext(account);
                Long id = 1L;

                // When
                doNothing().when(bannerRepo).deleteAllByShopId(id);

                // Then
                bannerService.deleteAllBanners(id, account);

                // Verify
                verify(bannerRepo, times(1)).deleteAllByShopId(id);
        }

        @Test
        public void whenDeleteAllSellerBanners_ThenSuccess() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                Shop altShop = Shop.builder().id(2L).owner(altAccount).build();
                SecurityContextHolder.clearContext();
                setupSecurityContext(altAccount);

                // When
                doNothing().when(bannerRepo).deleteAllByShop_Owner(altAccount);

                // Then
                bannerService.deleteAllBanners(null, altAccount);

                // Verify
                verify(bannerRepo, times(1)).deleteAllByShop_Owner(altAccount);
        }

        @Test
        public void whenDeleteAllSellerShopBanners_ThenSuccess() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                Shop altShop = Shop.builder().id(2L).owner(altAccount).build();
                SecurityContextHolder.clearContext();
                setupSecurityContext(altAccount);

                // When
                doNothing().when(bannerRepo).deleteAllByShopIdAndShop_Owner(altShop.getId(), altAccount);

                // Then
                bannerService.deleteAllBanners(altShop.getId(), altAccount);

                // Verify
                verify(bannerRepo, times(1)).deleteAllByShopIdAndShop_Owner(altShop.getId(), altAccount);
        }
}