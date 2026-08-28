package com.bookflow.expense.service.impl;

import com.bookflow.cash.entity.CashRegister;
import com.bookflow.cash.entity.CashRegisterStatus;
import com.bookflow.cash.repository.CashRegisterRepository;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.expense.dto.request.CreateExpenseRequest;
import com.bookflow.expense.dto.response.ExpenseResponse;
import com.bookflow.expense.entity.Expense;
import com.bookflow.expense.repository.ExpenseRepository;
import com.bookflow.expense.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseServiceImpl
    implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CompanyRepository companyRepository;
    private final CashRegisterRepository cashRegisterRepository;

    @Override
    public ExpenseResponse create(
        Long companyId,
        CreateExpenseRequest request
    ) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: "
                        + companyId
                )
            );

        CashRegister cashRegister = cashRegisterRepository
            .findByCompanyIdAndStatus(
                companyId,
                CashRegisterStatus.OPEN
            )
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "La empresa no tiene una caja abierta."
                )
            );

        Expense expense = new Expense();
        expense.setCompany(company);
        expense.setCashRegister(cashRegister);
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(LocalDateTime.now());
        expense.setCategory(request.getCategory());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setDescription(request.getDescription());

        expense = expenseRepository.save(expense);

        return toResponse(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse findById(
        Long companyId,
        Long expenseId
    ) {

        Expense expense = expenseRepository
            .findByIdAndCompanyId(expenseId, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el gasto con id: "
                        + expenseId
                )
            );

        return toResponse(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> findAllByCompany(
        Long companyId
    ) {

        companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: "
                        + companyId
                )
            );

        return expenseRepository
            .findAllByCompanyId(companyId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> findAllByCashRegister(
        Long companyId,
        Long cashRegisterId
    ) {

        cashRegisterRepository
            .findByIdAndCompanyId(
                cashRegisterId,
                companyId
            )
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la caja con id: "
                        + cashRegisterId
                )
            );

        return expenseRepository
            .findAllByCashRegisterId(cashRegisterId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    private ExpenseResponse toResponse(Expense expense) {

        ExpenseResponse response = new ExpenseResponse();
        response.setId(expense.getId());
        response.setCompanyId(expense.getCompany().getId());
        response.setCashRegisterId(
            expense.getCashRegister().getId()
        );
        response.setAmount(expense.getAmount());
        response.setExpenseDate(expense.getExpenseDate());
        response.setCategory(expense.getCategory());
        response.setPaymentMethod(expense.getPaymentMethod());
        response.setDescription(expense.getDescription());

        return response;
    }
}
