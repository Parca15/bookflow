package com.bookflow.payment.dto.request;

import com.bookflow.payment.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePaymentRequest {

    @NotNull
    @DecimalMin(
        value = "0.01",
        message = "El valor del abono debe ser mayor que cero."
    )
    private BigDecimal amount;

    @NotNull
    private PaymentMethod paymentMethod;

    private String notes;
}