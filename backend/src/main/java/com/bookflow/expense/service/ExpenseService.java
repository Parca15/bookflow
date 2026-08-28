package com.bookflow.expense.service;

import com.bookflow.expense.dto.request.CreateExpenseRequest;
import com.bookflow.expense.dto.response.ExpenseResponse;

import java.util.List;

public interface ExpenseService {

    ExpenseResponse create(
        Long companyId,
        CreateExpenseRequest request
    );

    ExpenseResponse findById(
        Long companyId,
        Long expenseId
    );

    List<ExpenseResponse> findAllByCompany(Long companyId);

    List<ExpenseResponse> findAllByCashRegister(
        Long companyId,
        Long cashRegisterId
    );
}
