package com.ring.controller;

import com.ring.dto.response.ghn.GHNOrderStatusWebhookPayload;
import com.ring.model.entity.OrderDetail;
import com.ring.model.enums.OrderStatus;
import com.ring.repository.OrderDetailRepository;
import com.ring.service.GHNService;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class GHNControllerWebhookTest {

    @Test
    void webhookUpdatesOrderStatusAndPersistsOrderCode() throws Exception {
        GHNService ghnService = mock(GHNService.class);
        OrderDetailRepository repo = mock(OrderDetailRepository.class);
        GHNController controller = new GHNController(ghnService, repo);

        // set @Value field
        Field f = GHNController.class.getDeclaredField("ghnShopId");
        f.setAccessible(true);
        f.set(controller, 123);

        OrderDetail detail = OrderDetail.builder().id(1L).status(OrderStatus.PENDING).orderCode(null).build();
        when(repo.findByOrderCode("Z82BS")).thenReturn(Optional.of(detail));
        when(repo.save(any(OrderDetail.class))).thenAnswer(inv -> inv.getArgument(0));

        GHNOrderStatusWebhookPayload payload = new GHNOrderStatusWebhookPayload();
        payload.setShopId(123);
        payload.setOrderCode("Z82BS");
        payload.setStatus("delivering");

        controller.orderWebhook(payload);

        assertEquals("Z82BS", detail.getOrderCode());
        assertEquals(OrderStatus.SHIPPING, detail.getStatus());
        verify(repo, times(1)).save(any(OrderDetail.class));
    }

    @Test
    void webhookDoesNotChangeTerminalCompletedStatus() throws Exception {
        GHNService ghnService = mock(GHNService.class);
        OrderDetailRepository repo = mock(OrderDetailRepository.class);
        GHNController controller = new GHNController(ghnService, repo);

        Field f = GHNController.class.getDeclaredField("ghnShopId");
        f.setAccessible(true);
        f.set(controller, 123);

        OrderDetail detail = OrderDetail.builder().id(1L).status(OrderStatus.COMPLETED).orderCode("Z82BS").build();
        when(repo.findByOrderCode("Z82BS")).thenReturn(Optional.of(detail));
        when(repo.save(any(OrderDetail.class))).thenAnswer(inv -> inv.getArgument(0));

        GHNOrderStatusWebhookPayload payload = new GHNOrderStatusWebhookPayload();
        payload.setShopId(123);
        payload.setOrderCode("Z82BS");
        payload.setStatus("delivering");

        controller.orderWebhook(payload);

        assertEquals(OrderStatus.COMPLETED, detail.getStatus());
        verify(repo, times(1)).save(any(OrderDetail.class));
    }
}

