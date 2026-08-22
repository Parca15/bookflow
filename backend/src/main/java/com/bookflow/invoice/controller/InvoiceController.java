package com.bookflow.invoice.controller;

import com.bookflow.invoice.dto.response.InvoiceResponse;
import com.bookflow.invoice.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/appointment/{appointmentId}")
    public ResponseEntity<InvoiceResponse> create(
        @PathVariable Long appointmentId
    ) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                invoiceService.create(
                    appointmentId
                )
            );
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> findById(
        @PathVariable Long id
    ) {

        return ResponseEntity.ok(
            invoiceService.findById(id)
        );
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<InvoiceResponse>
    findByAppointmentId(
        @PathVariable Long appointmentId
    ) {

        return ResponseEntity.ok(
            invoiceService.findByAppointmentId(
                appointmentId
            )
        );
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(
        @PathVariable Long id
    ) {

        invoiceService.cancel(id);

        return ResponseEntity
            .noContent()
            .build();
    }
}