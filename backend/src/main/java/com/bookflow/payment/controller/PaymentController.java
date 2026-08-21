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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/appointment/{appointmentId}")
    public ResponseEntity<PaymentResponse> create(
        @PathVariable Long appointmentId,
        @Valid @RequestBody CreatePaymentRequest request
    ) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                paymentService.create(
                    appointmentId,
                    request
                )
            );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> findById(
        @PathVariable Long id
    ) {

        return ResponseEntity.ok(
            paymentService.findById(id)
        );
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<PaymentResponse>>
    findAllByAppointment(
        @PathVariable Long appointmentId
    ) {

        return ResponseEntity.ok(
            paymentService.findAllByAppointment(
                appointmentId
            )
        );
    }

    @GetMapping("/appointment/{appointmentId}/total")
    public ResponseEntity<BigDecimal> calculateTotalPaid(
        @PathVariable Long appointmentId
    ) {

        return ResponseEntity.ok(
            paymentService.calculateTotalPaid(
                appointmentId
            )
        );
    }

    @GetMapping("/appointment/{appointmentId}/balance")
    public ResponseEntity<BigDecimal> calculateBalance(
        @PathVariable Long appointmentId
    ) {

        return ResponseEntity.ok(
            paymentService.calculateBalance(
                appointmentId
            )
        );
    }
}