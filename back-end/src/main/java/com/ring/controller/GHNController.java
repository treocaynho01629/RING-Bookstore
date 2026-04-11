package com.ring.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ring.service.GHNService;
import com.ring.common.GhnStatusMapper;
import com.ring.dto.response.ghn.ProvincesResponse;
import com.ring.dto.response.ghn.DistrictsResponse;
import com.ring.dto.response.ghn.WardsResponse;
import com.ring.dto.request.ghn.GHNCreateStoreRequest;
import com.ring.dto.request.ghn.GHNFeeRequest;
import com.ring.dto.request.ghn.GHNGetStoresRequest;
import com.ring.dto.response.ghn.GHNCreateStoreResponse;
import com.ring.dto.response.ghn.GHNFeeResponse;
import com.ring.dto.response.ghn.GHNGetStoresResponse;
import com.ring.dto.response.ghn.GHNOrderStatusWebhookPayload;
import com.ring.model.entity.OrderDetail;
import com.ring.model.enums.OrderStatus;
import com.ring.repository.OrderDetailRepository;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.apache.commons.lang3.StringUtils;

/**
 * Controller named {@link GHNController} for handling GHN-related
 * operations.
 * Provides endpoints for getting provinces from GHN.
 * Exposes endpoints under "/api/ghn".
 */
@RestController
@RequestMapping("/api/ghn")
@RequiredArgsConstructor
public class GHNController {

    private final GHNService ghnService;
    private final OrderDetailRepository detailRepo;

    @Value("${ghn.api.shop-id}")
    private Integer ghnShopId;

    /**
     * Gets all provinces from GHN.
     *
     * @return a list of provinces.
     */
    @GetMapping("/provinces")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:address')")
    public ResponseEntity<ProvincesResponse> getProvinces() {
        ProvincesResponse provinces = ghnService.getProvinces();
        return new ResponseEntity<>(provinces, HttpStatus.OK);
    }

    /**
     * Gets all districts by province id from GHN.
     *
     * @param provinceId province id
     * @return a list of districts.
     */
    @GetMapping("/districts")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:address')")
    public ResponseEntity<DistrictsResponse> getDistricts(@RequestParam("provinceId") Integer provinceId) {
        DistrictsResponse districts = ghnService.getDistricts(provinceId);
        return new ResponseEntity<>(districts, HttpStatus.OK);
    }

    /**
     * Gets all wards by district id from GHN.
     *
     * @param districtId district id
     * @return a list of wards.
     */
    @GetMapping("/wards")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:address')")
    public ResponseEntity<WardsResponse> getWards(@RequestParam("districtId") Integer districtId) {
        WardsResponse wards = ghnService.getWards(districtId);
        return new ResponseEntity<>(wards, HttpStatus.OK);
    }

    /**
     * Calculate shipping fee.
     */
    @PostMapping("/shipping/fee")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:order')")
    public ResponseEntity<GHNFeeResponse> calculateFee(@RequestBody GHNFeeRequest request) {
        GHNFeeResponse response = ghnService.calculateFee(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Ticket webhook receiver (public endpoint).
     * GHN expects HTTP 200; we acknowledge receipt.
     */
    @PostMapping("/ticket/webhook")
    public ResponseEntity<Map<String, Object>> ticketWebhook(@RequestBody(required = false) Object payload) {
        return ResponseEntity.ok(Map.of("code", 200, "message", "received"));
    }

    /**
     * Order status webhook receiver (public endpoint).
     * GHN expects HTTP 200; we acknowledge receipt.
     */
    @PostMapping("/order/webhook")
    public ResponseEntity<Map<String, Object>> orderWebhook(
            @RequestBody(required = false) GHNOrderStatusWebhookPayload payload) {

        try {
            if (payload == null) {
                return ResponseEntity.ok(Map.of("code", 200, "message", "received"));
            }

            if (payload.getShopId() != null && ghnShopId != null && !payload.getShopId().equals(ghnShopId)) {
                // Ignore mismatched shopId but acknowledge to avoid retries.
                return ResponseEntity.ok(Map.of("code", 200, "message", "received"));
            }

            OrderDetail detail = null;
            if (StringUtils.isNotBlank(payload.getOrderCode())) {
                detail = detailRepo.findByOrderCode(payload.getOrderCode()).orElse(null);
            }

            if (detail == null && StringUtils.isNotBlank(payload.getClientOrderCode())
                    && payload.getClientOrderCode().startsWith("OD-")) {
                try {
                    Long id = Long.parseLong(payload.getClientOrderCode().substring(3));
                    detail = detailRepo.findById(id).orElse(null);
                } catch (Exception ignored) {
                }
            }

            if (detail == null) {
                return ResponseEntity.ok(Map.of("code", 200, "message", "received"));
            }

            // Persist GHN order code if missing
            if (StringUtils.isBlank(detail.getOrderCode()) && StringUtils.isNotBlank(payload.getOrderCode())) {
                detail.setOrderCode(payload.getOrderCode());
            }

            OrderStatus next = GhnStatusMapper.toOrderStatus(payload.getStatus());
            if (next != null && isMonotonic(detail.getStatus(), next)) {
                detail.setStatus(next);
            }

            if (StringUtils.isNotBlank(payload.getReason())) {
                detail.setNote(payload.getReason());
            }

            detailRepo.save(detail);
        } catch (Exception ignored) {
            // Always return 200 to avoid GHN retries; errors should be handled via logs/monitoring.
        }

        return ResponseEntity.ok(Map.of("code", 200, "message", "received"));
    }

    private boolean isMonotonic(OrderStatus current, OrderStatus next) {
        if (current == null || next == null) {
            return true;
        }

        // Do not regress terminal states.
        if (OrderStatus.COMPLETED.equals(current) || OrderStatus.CANCELED.equals(current)
                || OrderStatus.REFUNDED.equals(current)) {
            return current.equals(next);
        }

        return true;
    }

    /**
     * Create GHN store (pickup address).
     */
    @PostMapping("/store/register")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('update:shop')")
    public ResponseEntity<GHNCreateStoreResponse> createStore(@RequestBody GHNCreateStoreRequest request) {
        GHNCreateStoreResponse response = ghnService.createStore(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * List GHN stores.
     */
    @PostMapping("/store/all")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('read:shop')")
    public ResponseEntity<GHNGetStoresResponse> getStores(@RequestBody GHNGetStoresRequest request) {
        GHNGetStoresResponse response = ghnService.getStores(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
