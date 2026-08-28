package com.bookflow.expense.dto.request;

import com.bookflow.expense.entity.ExpenseCategory;
import com.bookflow.payment.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateExpenseRequest {

    @NotNull
    @DecimalMin(
        value = "0.01",
        message = "El monto debe ser mayor que cero."
    )
    private BigDecimal amount;

    @NotNull
    private ExpenseCategory category;

    @NotNull
    private PaymentMethod paymentMethod;

    private String description;
}
