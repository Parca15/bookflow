package com.bookflow.payment.controller;

import com.bookflow.payment.dto.request.CreatePaymentRequest;
import com.bookflow.payment.dto.response.PaymentResponse;
import com.bookflow.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/appointment/{appointmentId}")
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
