package com.bookflow.invoice.controller;

import com.bookflow.invoice.dto.response.InvoiceResponse;
import com.bookflow.invoice.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/companies/{companyId}/invoices/appointment/{appointmentId}")
    public ResponseEntity<InvoiceResponse> create(
        @PathVariable Long companyId,
        @PathVariable Long appointmentId
    ) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                invoiceService.create(
                    companyId,
                    appointmentId
                )
            );
    }

    @GetMapping("/companies/{companyId}/invoices/{id}")
    public ResponseEntity<InvoiceResponse> findById(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        return ResponseEntity.ok(
            invoiceService.findById(companyId, id)
        );
    }

    @GetMapping("/companies/{companyId}/invoices/appointment/{appointmentId}")
    public ResponseEntity<InvoiceResponse>
    findByAppointmentId(
        @PathVariable Long companyId,
        @PathVariable Long appointmentId
    ) {

        return ResponseEntity.ok(
            invoiceService.findByAppointmentId(
                companyId,
                appointmentId
            )
        );
    }

    @PatchMapping("/companies/{companyId}/invoices/{id}/cancel")
    public ResponseEntity<Void> cancel(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        invoiceService.cancel(companyId, id);

        return ResponseEntity
            .noContent()
            .build();
    }
}
