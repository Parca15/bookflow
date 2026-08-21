package com.bookflow.payment.service;

import com.bookflow.payment.dto.request.CreatePaymentRequest;
import com.bookflow.payment.dto.response.PaymentResponse;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {

    PaymentResponse create(
        Long appointmentId,
        CreatePaymentRequest request
    );

    PaymentResponse findById(Long id);

    List<PaymentResponse> findAllByAppointment(
        Long appointmentId
    );

    BigDecimal calculateTotalPaid(
        Long appointmentId
    );

    BigDecimal calculateBalance(
        Long appointmentId
    );
}