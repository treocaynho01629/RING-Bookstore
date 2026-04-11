package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.dto.request.ghn.GHNCreateStoreRequest;
import com.ring.dto.request.ghn.GHNCreateOrderRequest;
import com.ring.dto.request.ghn.GHNFeeRequest;
import com.ring.dto.request.ghn.GHNGetStoresRequest;
import com.ring.dto.request.ghn.GHNOrderDetailByClientCodeRequest;
import com.ring.dto.request.ghn.GHNOrderDetailRequest;
import com.ring.dto.request.ghn.GHNSwitchStatusRequest;
import com.ring.dto.request.ghn.GHNUpdateOrderRequest;
import com.ring.dto.response.ghn.DistrictsResponse;
import com.ring.dto.response.ghn.GHNBasicResponse;
import com.ring.dto.response.ghn.GHNCreateStoreResponse;
import com.ring.dto.response.ghn.GHNCreateOrderResponse;
import com.ring.dto.response.ghn.GHNFeeResponse;
import com.ring.dto.response.ghn.GHNGetStoresResponse;
import com.ring.dto.response.ghn.ProvincesResponse;
import com.ring.dto.response.ghn.GHNOrderDetailResponse;
import com.ring.dto.response.ghn.GHNSwitchStatusResponse;
import com.ring.dto.response.ghn.WardsResponse;
import com.ring.exception.GHNException;
import com.ring.service.GHNService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@RequiredArgsConstructor
@Service
public class GHNServiceImpl implements GHNService {

    @Value("${ghn.api.token}")
    private String token;

    @Value("${ghn.api.shop-id}")
    private Integer defaultShopId;

    @Value("${ghn.api.url}")
    private String url;

    private final RestTemplate restTemplate;

    @Cacheable(cacheNames = AppConstants.PROVINCES)
    public ProvincesResponse getProvinces() {
        return restTemplate.exchange(
                url + "/master-data/province",
                HttpMethod.GET,
                getEntity(null, null),
                ProvincesResponse.class).getBody();
    }

    @Cacheable(cacheNames = AppConstants.DISTRICTS, key = "#provinceId")
    public DistrictsResponse getDistricts(Integer provinceId) {
        return restTemplate.exchange(
                url + "/master-data/district",
                HttpMethod.POST,
                getEntity(Map.of("province_id", provinceId), null),
                DistrictsResponse.class).getBody();
    }

    @Cacheable(cacheNames = AppConstants.WARDS, key = "#districtId")
    public WardsResponse getWards(Integer districtId) {
        return restTemplate.exchange(
                url + "/master-data/ward?district_id=" + districtId,
                HttpMethod.POST,
                getEntity(Map.of("district_id", districtId), null),
                WardsResponse.class).getBody();
    }

    public GHNFeeResponse calculateFee(GHNFeeRequest request, Integer ghnShopId) {
        GHNFeeResponse response = restTemplate.exchange(
                url + "/v2/shipping-order/fee",
                HttpMethod.POST,
                getEntity(request, ghnShopId != null ? ghnShopId : defaultShopId),
                GHNFeeResponse.class).getBody();
        if (response.getCode().equals(HttpStatus.OK.value())) {
            return response;
        } else {
            throw new GHNException(HttpStatus.valueOf(response.getCode()), AppConstants.GHN_FAILED,
                    response.getMessage());
        }
    }

    public GHNCreateStoreResponse createStore(GHNCreateStoreRequest request) {
        return restTemplate.exchange(
                url + "/v2/shop/register",
                HttpMethod.POST,
                getEntity(request, defaultShopId),
                GHNCreateStoreResponse.class).getBody();
    }

    public GHNGetStoresResponse getStores(GHNGetStoresRequest request) {
        return restTemplate.exchange(
                url + "/v2/shop/all",
                HttpMethod.POST,
                getEntity(request, defaultShopId),
                GHNGetStoresResponse.class).getBody();
    }

    public GHNCreateOrderResponse createOrder(GHNCreateOrderRequest request) {
        return restTemplate.exchange(
                url + "/v2/shipping-order/create",
                HttpMethod.POST,
                getEntity(request, defaultShopId),
                GHNCreateOrderResponse.class).getBody();
    }

    public GHNOrderDetailResponse getOrderDetail(GHNOrderDetailRequest request) {
        return restTemplate.exchange(
                url + "/v2/shipping-order/detail",
                HttpMethod.POST,
                getEntity(request, null),
                GHNOrderDetailResponse.class).getBody();
    }

    public GHNOrderDetailResponse getOrderDetailByClientCode(GHNOrderDetailByClientCodeRequest request) {
        return restTemplate.exchange(
                url + "/v2/shipping-order/detail-by-client-code",
                HttpMethod.POST,
                getEntity(request, null),
                GHNOrderDetailResponse.class).getBody();
    }

    public GHNBasicResponse updateOrder(GHNUpdateOrderRequest request) {
        return restTemplate.exchange(
                url + "/v2/shipping-order/update",
                HttpMethod.POST,
                getEntity(request, defaultShopId),
                GHNBasicResponse.class).getBody();
    }

    public GHNSwitchStatusResponse cancelOrders(GHNSwitchStatusRequest request) {
        return restTemplate.exchange(
                url + "/v2/switch-status/cancel",
                HttpMethod.POST,
                getEntity(request, defaultShopId),
                GHNSwitchStatusResponse.class).getBody();
    }

    public GHNSwitchStatusResponse returnOrders(GHNSwitchStatusRequest request) {
        return restTemplate.exchange(
                url + "/v2/switch-status/return",
                HttpMethod.POST,
                getEntity(request, defaultShopId),
                GHNSwitchStatusResponse.class).getBody();
    }

    private HttpEntity<Object> getEntity(Object body, Integer shopId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("Token", token);
        if (shopId != null && shopId > 0) {
            headers.set("ShopId", String.valueOf(shopId));
        }
        return new HttpEntity<>(body, headers);
    }
}
