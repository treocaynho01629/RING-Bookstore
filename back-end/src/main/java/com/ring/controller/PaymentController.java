package com.ring.controller;

import com.ring.dto.request.ConfirmWebhookRequest;
import com.ring.model.entity.PaymentInfo;
import com.ring.service.OrderService;
import com.ring.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import com.ring.service.impl.MessageService;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import vn.payos.model.webhooks.ConfirmWebhookResponse;
import vn.payos.core.FileDownloadResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.invoices.InvoicesInfo;

/**
 * Controller named {@link PaymentController} for handling payments-related
 * operations.
 * Exposes endpoints under "/api/payments".
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final MessageService messageService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('read:order')")
    public ResponseEntity<PaymentLink> getPaymentLink(@PathVariable("id") Long id) {

        PaymentLink payment = orderService.getPaymentLinkData(id);
        return new ResponseEntity<>(payment, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('update:order')")
    public ResponseEntity<String> cancel(
            @PathVariable("id") Long id,
            @RequestParam(value = "reason", required = false) String reason) {

        paymentService.cancel(id, reason);
        String message = messageService.getMessage("message.update.succeeded");

        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    @PostMapping("/create-payment-link/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('create:order')")
    public ResponseEntity<PaymentInfo> createPaymentLink(
            HttpServletRequest request,
            @PathVariable("id") Long id) {

        PaymentInfo paymentInfo = orderService.createPaymentLink(request, id);
        return new ResponseEntity<>(paymentInfo, HttpStatus.OK);
    }

    @PostMapping("/payos_transfer_handler")
    public ResponseEntity<String> payosTransferHandler(@RequestBody Object webhookBody) {

        paymentService.handlePayOS(webhookBody);
        String message = messageService.getMessage("message.webhook.delivered");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping("/confirm-webhook")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('read:order')")
    public ResponseEntity<ConfirmWebhookResponse> confirmWebhook(@RequestBody ConfirmWebhookRequest request) {

        ConfirmWebhookResponse response = paymentService.confirmWebhook(request.getWebhookUrl());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping(path = "/{orderId}/invoices")
    public ResponseEntity<InvoicesInfo> retrieveInvoices(@PathVariable("orderId") long orderId) {

        InvoicesInfo invoicesInfo = paymentService.getInvoices(orderId);
        return new ResponseEntity<>(invoicesInfo, HttpStatus.OK);
    }

    @GetMapping(path = "/{orderId}/invoices/{invoiceId}/download")
    public ResponseEntity<?> downloadInvoice(
            @PathVariable("orderId") long orderId, @PathVariable("invoiceId") String invoiceId) {
        FileDownloadResponse invoiceFile = paymentService.downloadInvoice(orderId, invoiceId);

        ByteArrayResource resource = new ByteArrayResource(invoiceFile.getData());

        HttpHeaders headers = new HttpHeaders();
        String contentType = invoiceFile.getContentType() == null
                ? MediaType.APPLICATION_PDF_VALUE
                : invoiceFile.getContentType();
        headers.set(HttpHeaders.CONTENT_TYPE, contentType);
        headers.set(
                HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + invoiceFile.getFilename() + "\"");
        if (invoiceFile.getSize() != null) {
            headers.setContentLength(invoiceFile.getSize());
        }

        return ResponseEntity.ok().headers(headers).body(resource);
    }
}
