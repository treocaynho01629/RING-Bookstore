package com.ring.service;

import java.util.List;

import com.ring.dto.response.ghn.ProvincesResponse.ProvinceItemResponse;
import com.ring.dto.response.ghn.DistrictsResponse.DistrictItemResponse;
import com.ring.dto.response.ghn.WardsResponse.WardItemResponse;
import com.ring.dto.request.ghn.GHNFeeRequest;
import com.ring.dto.request.ghn.GHNCreateStoreRequest;
import com.ring.dto.request.ghn.GHNGetStoresRequest;
import com.ring.dto.request.ghn.GHNCreateOrderRequest;
import com.ring.dto.request.ghn.GHNSwitchStatusRequest;
import com.ring.dto.request.ghn.GHNUpdateOrderRequest;
import com.ring.dto.response.ghn.GHNCreateStoreResponse;
import com.ring.dto.response.ghn.GHNGetStoresResponse;
import com.ring.dto.response.ghn.GHNBasicResponse;
import com.ring.dto.response.ghn.GHNCreateOrderResponse.GHNCreateOrder;
import com.ring.dto.response.ghn.GHNOrderDetailResponse.GHNOrderDetail;
import com.ring.dto.response.ghn.GHNOrderDetailResponse;
import com.ring.dto.response.ghn.GHNSwitchStatusResponse;

/**
 * Service interface for handling GHN-related operations.
 */
public interface GHNService {

    /**
     * Retrieves all provinces from GHN.
     *
     * @return a list of provinces.
     */
    List<ProvinceItemResponse> getProvinces();

    /**
     * Retrieves all districts by province id from GHN.
     *
     * @param provinceId province id
     * @return a list of districts
     */
    List<DistrictItemResponse> getDistricts(Integer provinceId);

    /**
     * Retrieves all wards by district id from GHN.
     *
     * @param districtId district id
     * @return a list of wards
     */
    List<WardItemResponse> getWards(Integer districtId);

    /**
     * Calculates shipping fee based on route and package.
     * 
     * @param request   Request parameters
     * @param ghnShopId GHN shop ID
     * @return Shipping fee
     */
    Integer calculateFee(GHNFeeRequest request, Integer ghnShopId);

    /**
     * Registers a new GHN store (pickup address).
     * 
     * @param request Request parameters
     * @return Store creation response
     */
    GHNCreateStoreResponse createStore(GHNCreateStoreRequest request);

    /**
     * Lists GHN stores.
     * 
     * @param request Request parameters
     * @return Stores list response
     */
    GHNGetStoresResponse getStores(GHNGetStoresRequest request);

    /**
     * Creates a shipping order on GHN.
     * 
     * @param request Request parameters
     * @return Order creation response
     */
    GHNCreateOrder createOrder(GHNCreateOrderRequest request);

    /**
     * Retrieves GHN order detail by GHN order code.
     * 
     * @param orderCode Order code
     * @return GHN Order detail
     */
    GHNOrderDetail getOrderDetail(String orderCode);

    /**
     * Retrieves GHN order detail by client order code.
     * 
     * @param clientOrderCode Client order code
     * @return GHN Order detail
     */
    GHNOrderDetail getOrderDetailByClientCode(String clientOrderCode);

    /**
     * Updates GHN order information.
     * 
     * @param request Request parameters
     * @return Order update response
     */
    GHNBasicResponse updateOrder(GHNUpdateOrderRequest request);

    /**
     * Cancels GHN orders by their order codes.
     * 
     * @param request Request parameters
     * @return Order cancellation response
     */
    GHNSwitchStatusResponse cancelOrders(GHNSwitchStatusRequest request);

    /**
     * Switches GHN orders to return status by their order codes.
     * 
     * @param request Request parameters
     * @return Order return response
     */
    GHNSwitchStatusResponse returnOrders(GHNSwitchStatusRequest request);
}
