package com.bookflow.payment.controller;

import com.bookflow.payment.dto.request.CreatePaymentRequest;
import com.bookflow.payment.dto.response.PaymentResponse;
import com.bookflow.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public ResponseEntity<PaymentResponse> create(
        @PathVariable Long companyId,
        @PathVariable Long appointmentId,
        @Valid @RequestBody CreatePaymentRequest request
    ) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                paymentService.create(
                    companyId,
                    appointmentId,
                    request
                )
            );
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<PaymentResponse> findById(
        @PathVariable Long companyId,
        @PathVariable Long paymentId
    ) {

        return ResponseEntity.ok(
            paymentService.findById(
                companyId,
                paymentId
            )
        );
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<PaymentResponse>>
    findAllByAppointment(
        @PathVariable Long companyId,
        @PathVariable Long appointmentId
    ) {

        return ResponseEntity.ok(
            paymentService.findAllByAppointment(
                companyId,
                appointmentId
            )
        );
    }

    @GetMapping("/appointment/{appointmentId}/total")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<BigDecimal> calculateTotalPaid(
        @PathVariable Long companyId,
        @PathVariable Long appointmentId
    ) {

        return ResponseEntity.ok(
            paymentService.calculateTotalPaid(
                companyId,
                appointmentId
            )
        );
    }

    @GetMapping("/appointment/{appointmentId}/balance")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<BigDecimal> calculateBalance(
        @PathVariable Long companyId,
        @PathVariable Long appointmentId
    ) {

        return ResponseEntity.ok(
            paymentService.calculateBalance(
                companyId,
                appointmentId
            )
        );
    }
}
