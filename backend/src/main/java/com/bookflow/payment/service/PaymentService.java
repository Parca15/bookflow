package com.bookflow.payment.service;

import com.bookflow.payment.dto.request.CreatePaymentRequest;
import com.bookflow.payment.dto.response.PaymentResponse;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {

    PaymentResponse create(
        Long companyId,
        Long appointmentId,
        CreatePaymentRequest request
    );

    PaymentResponse findById(
        Long companyId,
        Long paymentId
    );

    List<PaymentResponse> findAllByAppointment(
        Long companyId,
        Long appointmentId
    );

    BigDecimal calculateTotalPaid(
        Long companyId,
        Long appointmentId
    );

    BigDecimal calculateBalance(
        Long companyId,
        Long appointmentId
    );
}
