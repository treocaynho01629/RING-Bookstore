package com.ring.common;

import com.ring.model.enums.OrderStatus;
import org.apache.commons.lang3.StringUtils;

import java.util.Locale;

public class GhnStatusMapper {

    private GhnStatusMapper() {
    }

    public static OrderStatus toOrderStatus(String ghnStatus) {
        if (StringUtils.isBlank(ghnStatus)) {
            return null;
        }

        String s = ghnStatus.trim().toLowerCase(Locale.ROOT);

        // Delivered / completed
        if (s.equals("delivered") || s.equals("finish") || s.equals("completed")) {
            return OrderStatus.COMPLETED;
        }

        // Cancelled
        if (s.equals("cancel") || s.equals("cancelled") || s.equals("canceled")) {
            return OrderStatus.CANCELED;
        }

        // Return flows
        if (s.equals("return") || s.equals("returning") || s.equals("returned")) {
            return OrderStatus.PENDING_RETURN;
        }

        // Pickup / warehouse / delivery flows
        if (s.equals("ready_to_pick") || s.equals("waiting_to_pick") || s.equals("picking")) {
            return OrderStatus.PENDING;
        }

        // In transit
        if (s.equals("picked") || s.equals("storing") || s.equals("delivering") || s.equals("transporting")) {
            return OrderStatus.SHIPPING;
        }

        // Fallback: keep as SHIPPING for any in-progress status we don't know.
        return OrderStatus.SHIPPING;
    }
}

