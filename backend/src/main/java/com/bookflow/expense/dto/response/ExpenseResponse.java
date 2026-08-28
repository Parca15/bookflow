package com.bookflow.expense.dto.response;

import com.bookflow.expense.entity.ExpenseCategory;
import com.bookflow.payment.entity.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ExpenseResponse {

    private Long id;

    private Long companyId;

    private Long cashRegisterId;

    private BigDecimal amount;

    private LocalDateTime expenseDate;

    private ExpenseCategory category;

    private PaymentMethod paymentMethod;

    private String description;
}
