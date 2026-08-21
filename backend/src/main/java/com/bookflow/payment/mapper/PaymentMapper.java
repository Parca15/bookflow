package com.bookflow.payment.mapper;

import com.bookflow.payment.dto.response.PaymentResponse;
import com.bookflow.payment.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {

        PaymentResponse response = new PaymentResponse();

        response.setId(payment.getId());

        response.setAppointmentId(
            payment.getAppointment().getId()
        );

        response.setAmount(
            payment.getAmount()
        );

        response.setPaymentDate(
            payment.getPaymentDate()
        );

        response.setPaymentMethod(
            payment.getPaymentMethod()
        );

        response.setNotes(
            payment.getNotes()
        );

        return response;
    }
}