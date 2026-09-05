package com.bookflow.cash.dto.response;

import com.bookflow.cash.entity.CashRegisterStatus;
import com.bookflow.expense.dto.response.ExpenseResponse;
import com.bookflow.payment.dto.response.PaymentResponse;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CashRegisterResponse {

    private Long id;

    private Long companyId;

    private LocalDateTime openingDate;

    private LocalDateTime closingDate;

    private BigDecimal openingAmount;

    private BigDecimal closingAmount;

    private BigDecimal expectedCashAmount;

    private BigDecimal cashDifference;

    private CashRegisterStatus status;

    private BigDecimal totalCashPayments;

    private BigDecimal totalCardPayments;

    private BigDecimal totalTransferPayments;

    private BigDecimal totalOtherPayments;

    private BigDecimal totalPayments;

    private BigDecimal totalCashExpenses;

    private BigDecimal totalCardExpenses;

    private BigDecimal totalTransferExpenses;

    private BigDecimal totalOtherExpenses;

    private BigDecimal totalExpenses;

    private BigDecimal netResult;

    private List<PaymentResponse> payments = new ArrayList<>();

    private List<ExpenseResponse> expenses = new ArrayList<>();
}
