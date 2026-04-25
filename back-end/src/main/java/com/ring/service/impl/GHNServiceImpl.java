package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.dto.request.ghn.GHNCreateStoreRequest;
import com.ring.dto.request.ghn.GHNCreateOrderRequest;
import com.ring.dto.request.ghn.GHNFeeRequest;
import com.ring.dto.request.ghn.GHNGetStoresRequest;
import com.ring.dto.request.ghn.GHNSwitchStatusRequest;
import com.ring.dto.request.ghn.GHNUpdateOrderRequest;
import com.ring.dto.response.ghn.DistrictsResponse;
import com.ring.dto.response.ghn.ProvincesResponse.ProvinceItemResponse;
import com.ring.dto.response.ghn.DistrictsResponse.DistrictItemResponse;
import com.ring.dto.response.ghn.GHNOrderDetailResponse.GHNOrderDetail;
import com.ring.dto.response.ghn.GHNBasicResponse;
import com.ring.dto.response.ghn.GHNCreateOrderResponse;
import com.ring.dto.response.ghn.GHNCreateStoreResponse;
import com.ring.dto.response.ghn.GHNCreateOrderResponse.GHNCreateOrder;
import com.ring.dto.response.ghn.GHNFeeResponse;
import com.ring.dto.response.ghn.GHNGetStoresResponse;
import com.ring.dto.response.ghn.GHNOrderDetailResponse;
import com.ring.dto.response.ghn.GHNSwitchStatusResponse;
import com.ring.dto.response.ghn.ProvincesResponse;
import com.ring.dto.response.ghn.WardsResponse.WardItemResponse;
import com.ring.dto.response.ghn.WardsResponse;
import com.ring.exception.GHNException;
import com.ring.service.GHNService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.List;

@RequiredArgsConstructor
@Service
public class GHNServiceImpl implements GHNService {

    @Value("${ghn.api.token}")
    private String token;

    @Value("${ghn.api.shop-id}")
    private Integer defaultShopId;

    @Value("${ghn.default.service-type-id}")
    private Integer ghnDefaultServiceTypeId;

    @Value("${ghn.api.url}")
    private String url;

    private final RestTemplate restTemplate;
    private final MessageService messageService;

    @Cacheable(cacheNames = AppConstants.PROVINCES)
    public List<ProvinceItemResponse> getProvinces() {
        try {
            ProvincesResponse response = restTemplate.exchange(
                    url + "/master-data/province",
                    HttpMethod.GET,
                    getEntity(null, null),
                    ProvincesResponse.class).getBody();
            return response.getData();
        } catch (HttpClientErrorException e) {
            throw new GHNException(e);
        }
    }

    @Cacheable(cacheNames = AppConstants.DISTRICTS, key = "#provinceId")
    public List<DistrictItemResponse> getDistricts(Integer provinceId) {
        try {
            DistrictsResponse response = restTemplate.exchange(
                    url + "/master-data/district",
                    HttpMethod.GET,
                    getEntity(Map.of("province_id", provinceId), null),
                    DistrictsResponse.class).getBody();
            return response.getData();
        } catch (HttpClientErrorException e) {
            throw new GHNException(e);
        }
    }

    @Cacheable(cacheNames = AppConstants.WARDS, key = "#districtId")
    public List<WardItemResponse> getWards(Integer districtId) {
        try {
            WardsResponse response = restTemplate.exchange(
                    url + "/master-data/ward?district_id=" + districtId,
                    HttpMethod.POST,
                    getEntity(Map.of("district_id", districtId), null),
                    WardsResponse.class).getBody();
            return response.getData();
        } catch (HttpClientErrorException e) {
            throw new GHNException(e);
        }
    }

    public Integer calculateFee(GHNFeeRequest request, Integer ghnShopId) {

        Integer serviceTypeId = request.getServiceTypeId();
        if (serviceTypeId == null) {
            request.setServiceTypeId(ghnDefaultServiceTypeId);
        }

        try {
            GHNFeeResponse response = restTemplate.exchange(
                    url + "/v2/shipping-order/fee",
                    HttpMethod.POST,
                    getEntity(request, defaultShopId), // TODO: replace with ghnShopId
                    GHNFeeResponse.class).getBody();
            return response.getData().getTotal();
        } catch (HttpClientErrorException e) {
            throw new GHNException(e);
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

    public GHNCreateOrder createOrder(GHNCreateOrderRequest request) {
        try {
            GHNCreateOrderResponse response = restTemplate.exchange(
                    url + "/v2/shipping-order/create",
                    HttpMethod.POST,
                    getEntity(request, defaultShopId),
                    GHNCreateOrderResponse.class).getBody();
            return response.getData();
        } catch (HttpClientErrorException e) {
            throw new GHNException(e);
        }
    }

    public GHNOrderDetail getOrderDetail(String orderCode) {
        try {
            GHNOrderDetailResponse response = restTemplate.exchange(
                    url + "/v2/shipping-order/detail",
                    HttpMethod.POST,
                    getEntity(Map.of("order_code", orderCode), null),
                    GHNOrderDetailResponse.class).getBody();
            return response.getData();
        } catch (HttpClientErrorException e) {
            throw new GHNException(e);
        }
    }

    public GHNOrderDetail getOrderDetailByClientCode(String clientOrderCode) {
        try {
            GHNOrderDetailResponse response = restTemplate.exchange(
                    url + "/v2/shipping-order/detail-by-client-code",
                    HttpMethod.POST,
                    getEntity(Map.of("client_order_code", clientOrderCode), null),
                    GHNOrderDetailResponse.class).getBody();
            return response.getData();
        } catch (HttpClientErrorException e) {
            throw new GHNException(e);
        }
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

    /**
     * Get the HTTP entity.
     *
     * @param body   The body.
     * @param shopId The shop ID.
     * @return The HTTP entity.
     */
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
