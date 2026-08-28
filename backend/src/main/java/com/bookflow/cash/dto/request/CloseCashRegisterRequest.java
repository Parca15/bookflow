package com.bookflow.cash.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CloseCashRegisterRequest {

    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal closingAmount;
}