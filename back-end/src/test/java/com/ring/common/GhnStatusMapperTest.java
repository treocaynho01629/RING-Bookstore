package com.ring.common;

import com.ring.model.enums.OrderStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GhnStatusMapperTest {

    @Test
    void mapsDeliveredToCompleted() {
        assertEquals(OrderStatus.COMPLETED, GhnStatusMapper.toOrderStatus("delivered"));
    }

    @Test
    void mapsCancelToCanceled() {
        assertEquals(OrderStatus.CANCELED, GhnStatusMapper.toOrderStatus("cancel"));
    }

    @Test
    void mapsReadyToPickToPending() {
        assertEquals(OrderStatus.PENDING, GhnStatusMapper.toOrderStatus("ready_to_pick"));
    }

    @Test
    void mapsPickedToShipping() {
        assertEquals(OrderStatus.SHIPPING, GhnStatusMapper.toOrderStatus("picked"));
    }

    @Test
    void blankReturnsNull() {
        assertNull(GhnStatusMapper.toOrderStatus(" "));
    }
}

