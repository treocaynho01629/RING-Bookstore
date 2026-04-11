package com.ring.service;

import com.ring.base.AbstractServiceTest;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.dto.projection.shops.*;
import com.ring.dto.request.AddressRequest;
import com.ring.dto.request.ShopRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.dto.response.shops.*;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.DashboardMapper;
import com.ring.mapper.ShopMapper;
import com.ring.model.entity.*;
import com.ring.model.enums.UserRole;
import com.ring.repository.AccountRepository;
import com.ring.repository.AddressRepository;
import com.ring.repository.ShopRepository;
import com.ring.service.impl.ShopServiceImpl;
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

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class ShopServiceTest extends AbstractServiceTest {

    @Mock
    private ShopRepository shopRepo;

    @Mock
    private AccountRepository accountRepo;

    @Mock
    private AddressRepository addressRepo;

    @Mock
    private ImageService imageService;

    @Mock
    private ShopMapper shopMapper;

    @Mock
    private DashboardMapper dashMapper;

    @InjectMocks
    private ShopServiceImpl shopService;

    private final MockMultipartFile file = new MockMultipartFile(
            "file",
            "shop.png",
            MediaType.IMAGE_PNG_VALUE,
            "Hello, World!".getBytes());
    private final Image image = Image.builder().id(1L).name("shop.png").build();
    private final Role role = Role.builder()
            .roleName(UserRole.ROLE_ADMIN)
            .build();
    private Account account = Account.builder()
            .id(1L)
            .username("test")
            .following(new HashSet<>())
            .roles(List.of(role))
            .build();
    private final Address address = Address.builder()
            .id(1L)
            .name("Test Address")
            .companyName("Test Company")
            .phone("0123456789")
            .detail("Test")
            .address("Test Street")
            .build();
    private final Shop shop = Shop.builder()
            .id(1L)
            .name("Test Shop")
            .description("Test Description")
            .followers(new HashSet<>())
            .owner(account)
            .address(address)
            .image(image)
            .build();
    private final ShopRequest request = ShopRequest.builder()
            .name("Test Shop")
            .description("Test Description")
            .addressRequest(AddressRequest.builder()
                    .name("Test Address")
                    .companyName("Test Company")
                    .phone("0123456789")
                    .detail("Test")
                    .address("Test Street")
                    .build())
            .build();

    @AfterEach
    public void cleanUp() {
        account = Account.builder().id(1L).roles(List.of(role)).build();
        SecurityContextHolder.clearContext();
    }

    @Test
    public void whenGetDisplayShops_ThenReturnsPage() {

        // Given
        Pageable pageable = PageRequest.of(0, 10, Sort.by("id").descending());
        IShopDisplay projection = mock(IShopDisplay.class);
        Page<IShopDisplay> page = new PageImpl<>(List.of(projection), pageable, 1);
        PagingResponse<ShopDisplayDTO> expectedDTOS = new PagingResponse<>(List.of(mock(ShopDisplayDTO.class)), 1, 1L,
                10,
                0,
                false);

        // When
        when(shopRepo.findShopsDisplay(anyString(),
                anyBoolean(),
                anyLong(),
                any(Pageable.class))).thenReturn(page);
        when(shopMapper.displayToDTO(projection)).thenReturn(mock(ShopDisplayDTO.class));

        // Then
        PagingResponse<ShopDisplayDTO> result = shopService.getDisplayShops(0,
                10,
                "id",
                "desc",
                "",
                false,
                account);

        assertNotNull(result);
        assertEquals(expectedDTOS.getPage(), result.getPage());
        assertEquals(expectedDTOS.getSize(), result.getSize());
        assertEquals(expectedDTOS.getTotalElements(), result.getTotalElements());

        // Verify
        verify(shopRepo, times(1)).findShopsDisplay(anyString(),
                anyBoolean(),
                anyLong(),
                any(Pageable.class));
        verify(shopMapper, times(1)).displayToDTO(projection);
    }

    @Test
    public void whenGetShops_ThenReturnsPage() {

        // Given
        setupSecurityContext(account);
        Pageable pageable = PageRequest.of(0, 10, Sort.by("id").descending());
        IShop projection = mock(IShop.class);
        Page<IShop> page = new PageImpl<>(List.of(projection), pageable, 1);
        PagingResponse<ShopDTO> expectedDTOS = new PagingResponse<>(List.of(mock(ShopDTO.class)), 1, 1L, 10, 0, false);

        // When
        when(shopRepo.findShops(eq(""),
                isNull(),
                any(Pageable.class))).thenReturn(page);
        when(shopMapper.shopToDTO(projection)).thenReturn(mock(ShopDTO.class));

        // Then
        PagingResponse<ShopDTO> result = shopService.getShops(0,
                10,
                "id",
                "desc",
                "",
                null,
                account);

        assertNotNull(result);
        assertEquals(expectedDTOS.getPage(), result.getPage());
        assertEquals(expectedDTOS.getSize(), result.getSize());
        assertEquals(expectedDTOS.getTotalElements(), result.getTotalElements());

        // Verify
        verify(shopRepo, times(1)).findShops(eq(""),
                isNull(),
                any(Pageable.class));
        verify(shopMapper, times(1)).shopToDTO(projection);
    }

    @Test
    public void whenGetShopsPreview_ThenReturnsList() {

        // // Given
        // IShopPreview projection = mock(IShopPreview.class);
        // List<IShopPreview> projections = List.of(projection);
        // List<ShopPreviewDTO> expected = List.of(mock(ShopPreviewDTO.class));

        // // When
        // when(shopRepo.findShopsPreview(anyLong())).thenReturn(projections);
        // when(shopMapper.previewToDTO(projection)).thenReturn(mock(ShopPreviewDTO.class));

        // // Then
        // List<ShopPreviewDTO> result = shopService.getShopsPreview(account);

        // assertNotNull(result);
        // assertEquals(expected.size(), result.size());

        // // Verify
        // verify(shopRepo, times(1)).findShopsPreview(anyLong());
        // verify(shopMapper, times(1)).previewToDTO(projection);
    }

    @Test
    public void whenGetShopInfo_ThenReturnsInfoDTO() {

        // Given
        IShopInfo projection = mock(IShopInfo.class);
        ShopInfoDTO expected = mock(ShopInfoDTO.class);

        // When
        when(shopRepo.findShopInfoById(anyLong(), anyLong())).thenReturn(Optional.of(projection));
        when(shopMapper.infoToDTO(projection)).thenReturn(expected);

        // Then
        ShopInfoDTO result = shopService.getShopInfo(1L, account);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(shopRepo, times(1)).findShopInfoById(anyLong(), anyLong());
        verify(shopMapper, times(1)).infoToDTO(projection);
    }

    @Test
    public void whenGetNonExistingShopInfo_ThenThrowsException() {

        // When
        when(shopRepo.findShopInfoById(anyLong(), anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> shopService.getShopInfo(1L, account));
        assertEquals("Shop not found!", exception.getError());

        // Verify
        verify(shopRepo, times(1)).findShopInfoById(anyLong(), anyLong());
        verify(shopMapper, never()).infoToDTO(any(IShopInfo.class));
    }

    @Test
    public void whenGetShopDisplayDetail_ThenReturnsDisplayDetailDTO() {

        // Given
        IShopDisplayDetail projection = mock(IShopDisplayDetail.class);
        ShopDisplayDetailDTO expected = mock(ShopDisplayDetailDTO.class);

        // When
        when(shopRepo.findShopDisplayDetailById(anyLong(), anyLong())).thenReturn(Optional.of(projection));
        when(shopMapper.displayDetailToDTO(projection)).thenReturn(expected);

        // Then
        ShopDisplayDetailDTO result = shopService.getShopDisplayDetail(1L, account);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(shopRepo, times(1)).findShopDisplayDetailById(anyLong(), anyLong());
        verify(shopMapper, times(1)).displayDetailToDTO(projection);
    }

    @Test
    public void whenGetNonExistingShopDisplayDetail_ThenThrowsException() {

        // When
        when(shopRepo.findShopDisplayDetailById(anyLong(), anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> shopService.getShopDisplayDetail(1L, account));
        assertEquals("Shop not found!", exception.getError());

        // Verify
        verify(shopRepo, times(1)).findShopDisplayDetailById(anyLong(), anyLong());
        verify(shopMapper, never()).displayDetailToDTO(any((IShopDisplayDetail.class)));
    }

    @Test
    public void whenGetShopDetail_ThenReturnsDetailDTO() {

        // Given
        IShopDetail projection = mock(IShopDetail.class);
        ShopDetailDTO expected = mock(ShopDetailDTO.class);

        // When
        when(shopRepo.findShopDetailById(anyLong(), anyLong())).thenReturn(Optional.of(projection));
        when(shopMapper.detailToDTO(projection)).thenReturn(expected);

        // Then
        ShopDetailDTO result = shopService.getShopDetail(1L, account);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(shopRepo, times(1)).findShopDetailById(anyLong(), anyLong());
        verify(shopMapper, times(1)).detailToDTO(projection);
    }

    @Test
    public void whenGetNonExistingShopDetail_ThenThrowsException() {

        // When
        when(shopRepo.findShopDetailById(anyLong(), anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> shopService.getShopDetail(1L, account));
        assertEquals("Shop not found!", exception.getError());

        // Verify
        verify(shopRepo, times(1)).findShopDetailById(anyLong(), anyLong());
        verify(shopMapper, never()).detailToDTO(any(IShopDetail.class));
    }

    @Test
    public void whenGetAnalytics_ThenReturnsStatDTO() {

        // Given
        setupSecurityContext(account);
        StatDTO expected = mock(StatDTO.class);
        IStat stat = mock(IStat.class);

        // When
        when(shopRepo.getShopAnalytics(anyLong())).thenReturn(stat);
        when(dashMapper.statToDTO(eq(stat), anyString(), anyString())).thenReturn(expected);

        // Then
        StatDTO result = shopService.getAnalytics(1L, account);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(shopRepo, times(1)).getShopAnalytics(anyLong());
        verify(dashMapper, times(1)).statToDTO(eq(stat), anyString(), anyString());
    }

    @Test
    public void whenFollowShop_ThenSuccess() {

        // When
        when(shopRepo.findById(anyLong())).thenReturn(Optional.of(shop));
        when(shopRepo.save(any(Shop.class))).thenReturn(shop);

        // Then
        shopService.follow(1L, account);

        // Verify
        verify(shopRepo, times(1)).findById(anyLong());
        verify(shopRepo, times(1)).save(any(Shop.class));
    }

    @Test
    public void whenFollowNonExistingShop_ThenThrowsException() {

        // When
        when(shopRepo.findById(anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> shopService.follow(1L, account));
        assertEquals("Shop not found!", exception.getError());

        // Verify
        verify(shopRepo, times(1)).findById(anyLong());
        verify(shopRepo, never()).save(any(Shop.class));
    }

    @Test
    public void whenUnfollowShop_ThenSuccess() {

        // When
        when(shopRepo.findById(anyLong())).thenReturn(Optional.of(shop));

        // Then
        shopService.unfollow(1L, account);

        // Verify
        verify(shopRepo, times(1)).findById(anyLong());
        verify(shopRepo, times(1)).save(any(Shop.class));
    }

    @Test
    public void whenUnfollowNonExistingShop_ThenThrowsException() {
        // When
        when(shopRepo.findById(anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> shopService.unfollow(1L, account));
        assertEquals("Shop not found!", exception.getError());

        // Verify
        verify(shopRepo, times(1)).findById(anyLong());
        verify(shopRepo, never()).save(any(Shop.class));
    }

    @Test
    public void whenAddShop_ThenReturnsNewShop() {

        // When
        when(addressRepo.save(any(Address.class))).thenReturn(address);
        when(imageService.upload(any(MultipartFile.class), eq(FileUploadUtil.SHOP_FOLDER))).thenReturn(image);
        when(shopRepo.save(any(Shop.class))).thenReturn(shop);

        // Then
        Shop result = shopService.addShop(request, file, account);

        assertNotNull(result);
        assertEquals(shop, result);

        // Verify
        verify(addressRepo, times(1)).save(any(Address.class));
        verify(imageService, times(1)).upload(any(MultipartFile.class), eq(FileUploadUtil.SHOP_FOLDER));
        verify(shopRepo, times(1)).save(any(Shop.class));
    }

    @Test
    public void whenUpdateShop_ThenReturnsUpdatedShop() {

        // Given
        setupSecurityContext(account);

        // When
        when(shopRepo.findById(anyLong())).thenReturn(Optional.of(shop));
        when(addressRepo.save(any(Address.class))).thenReturn(address);
        when(imageService.upload(any(MultipartFile.class), eq(FileUploadUtil.SHOP_FOLDER))).thenReturn(image);
        when(shopRepo.save(any(Shop.class))).thenReturn(shop);

        // Then
        Shop result = shopService.updateShop(1L, request, file, account);

        assertNotNull(result);
        assertEquals(shop, result);

        // Verify
        verify(shopRepo, times(1)).findById(anyLong());
        verify(addressRepo, times(1)).save(any(Address.class));
        verify(imageService, times(1)).upload(any(MultipartFile.class), eq(FileUploadUtil.SHOP_FOLDER));
        verify(shopRepo, times(1)).save(any(Shop.class));
    }

    @Test
    public void whenUpdateNonExistingShop_ThenThrowsException() {

        // When
        when(shopRepo.findById(anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> shopService.updateShop(1L, request, file, account));
        assertEquals("Shop not found!", exception.getError());

        // Verify
        verify(shopRepo, times(1)).findById(anyLong());
        verify(addressRepo, never()).save(any(Address.class));
        verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.SHOP_FOLDER));
        verify(shopRepo, never()).save(any(Shop.class));
    }

    @Test
    public void whenUpdateSomeoneElseShop_ThenThrowsException() {

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
                () -> shopService.updateShop(1L, request, file, altAccount));
        assertEquals("Invalid ownership!", exception.getError());

        // Verify
        verify(shopRepo, times(1)).findById(anyLong());
        verify(addressRepo, never()).save(any(Address.class));
        verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.SHOP_FOLDER));
        verify(shopRepo, never()).save(any(Shop.class));
    }

    @Test
    public void whenDeleteShop_ThenReturnsDeletedShop() {

        // Given
        setupSecurityContext(account);

        // When
        when(shopRepo.findById(anyLong())).thenReturn(Optional.of(shop));
        doNothing().when(shopRepo).deleteById(anyLong());

        // Then
        Shop result = shopService.deleteShop(1L, account);

        assertNotNull(result);
        assertEquals(shop, result);

        // Verify
        verify(shopRepo, times(1)).findById(anyLong());
        verify(shopRepo, times(1)).deleteById(anyLong());
    }

    @Test
    public void whenDeleteNonExistingShop_ThenThrowsException() {

        // When
        when(shopRepo.findById(anyLong())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> shopService.deleteShop(1L, account));
        assertEquals("Shop not found!", exception.getError());

        // Verify
        verify(shopRepo, times(1)).findById(anyLong());
        verify(shopRepo, never()).deleteById(anyLong());
    }

    @Test
    public void whenDeleteSomeoneElseShop_ThenThrowsException() {

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
                () -> shopService.deleteShop(1L, altAccount));
        assertEquals("Invalid ownership!", exception.getError());

        // Verify
        verify(shopRepo, times(1)).findById(anyLong());
        verify(shopRepo, never()).deleteById(anyLong());
    }

    @Test
    public void whenDeleteShopsAsAdmin_ThenSuccess() {

        // Given
        setupSecurityContext(account);
        List<Long> ids = List.of(1L, 2L);

        // When
        doNothing().when(shopRepo).deleteAllById(anyList());

        // Then
        shopService.deleteShops(ids, account);

        // Verify
        verify(shopRepo, times(1)).deleteAllById(ids);
    }

    @Test
    public void whenDeleteShopsAsSeller_ThenSuccess() {

        // Given
        Account altAccount = Account.builder()
                .id(2L)
                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                .build();
        setupSecurityContext(altAccount);
        List<Long> ids = List.of(1L, 2L);

        // When
        when(shopRepo.findShopIdsByInIdsAndOwner(ids, altAccount.getId())).thenReturn(ids);
        doNothing().when(shopRepo).deleteAllById(ids);

        // Then
        shopService.deleteShops(ids, altAccount);

        // Verify
        verify(shopRepo, times(1)).findShopIdsByInIdsAndOwner(ids, altAccount.getId());
        verify(shopRepo, times(1)).deleteAllById(ids);
    }

    @Test
    public void whenDeleteShopsInverse_ThenSuccess() {

        // Given
        setupSecurityContext(account);
        List<Long> ids = List.of(1L, 2L);
        List<Long> inverseIds = List.of(3L);

        // When
        when(shopRepo.findInverseIds(eq(""), isNull(), eq(ids))).thenReturn(inverseIds);
        doNothing().when(shopRepo).deleteAllById(inverseIds);

        // Then
        shopService.deleteShopsInverse("", null, ids, account);

        // Verify
        verify(shopRepo, times(1)).findInverseIds(eq(""), isNull(), eq(ids));
        verify(shopRepo, times(1)).deleteAllById(inverseIds);
    }

    @Test
    public void whenDeleteAllShopsAsAdmin_ThenSuccess() {

        // Given
        setupSecurityContext(account);

        // When
        doNothing().when(shopRepo).deleteAll();

        // Then
        shopService.deleteAllShops(account);

        // Verify
        verify(shopRepo, times(1)).deleteAll();
    }

    @Test
    public void whenDeleteAllShopsAsSeller_ThenSuccess() {

        // Given
        Account altAccount = Account.builder()
                .id(2L)
                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                .build();
        setupSecurityContext(altAccount);

        // When
        doNothing().when(shopRepo).deleteAllByOwner(altAccount);

        // Then
        shopService.deleteAllShops(altAccount);

        // Verify
        verify(shopRepo, times(1)).deleteAllByOwner(altAccount);
    }
}