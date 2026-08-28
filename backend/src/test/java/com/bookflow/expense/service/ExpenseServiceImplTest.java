package com.bookflow.expense.service;

import com.bookflow.cash.entity.CashRegister;
import com.bookflow.cash.entity.CashRegisterStatus;
import com.bookflow.cash.repository.CashRegisterRepository;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.entity.CompanyStatus;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.expense.dto.request.CreateExpenseRequest;
import com.bookflow.expense.entity.ExpenseCategory;
import com.bookflow.expense.entity.Expense;
import com.bookflow.expense.repository.ExpenseRepository;
import com.bookflow.expense.service.impl.ExpenseServiceImpl;
import com.bookflow.payment.entity.PaymentMethod;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceImplTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CashRegisterRepository cashRegisterRepository;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private Company company;
    private CashRegister cashRegister;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);
        company.setBusinessName("Test Company");
        company.setStatus(CompanyStatus.ACTIVE);

        cashRegister = new CashRegister();
        cashRegister.setId(1L);
        cashRegister.setCompany(company);
        cashRegister.setStatus(CashRegisterStatus.OPEN);
    }

    @Test
    void create_expense_success() {
        when(companyRepository.findById(1L))
            .thenReturn(Optional.of(company));
        when(cashRegisterRepository.findByCompanyIdAndStatus(
            eq(1L), eq(CashRegisterStatus.OPEN)))
            .thenReturn(Optional.of(cashRegister));
        when(expenseRepository.save(any(Expense.class)))
            .thenAnswer(invocation -> {
                Expense e = invocation.getArgument(0);
                e.setId(1L);
                return e;
            });

        CreateExpenseRequest request =
            new CreateExpenseRequest();
        request.setAmount(new BigDecimal("50000"));
        request.setCategory(ExpenseCategory.SUPPLIES);
        request.setPaymentMethod(PaymentMethod.CASH);
        request.setDescription("Office supplies");

        var response = expenseService.create(1L, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("50000"),
            response.getAmount());
        assertEquals(ExpenseCategory.SUPPLIES,
            response.getCategory());
        assertEquals(1L, response.getCompanyId());
        assertEquals(1L, response.getCashRegisterId());
        verify(expenseRepository).save(any(Expense.class));
    }

    @Test
    void create_expense_company_not_found() {
        when(companyRepository.findById(99L))
            .thenReturn(Optional.empty());

        CreateExpenseRequest request =
            new CreateExpenseRequest();
        request.setAmount(new BigDecimal("50000"));
        request.setCategory(ExpenseCategory.SUPPLIES);
        request.setPaymentMethod(PaymentMethod.CASH);

        assertThrows(ResourceNotFoundException.class,
            () -> expenseService.create(99L, request));
    }

    @Test
    void create_expense_no_open_cash_register() {
        when(companyRepository.findById(1L))
            .thenReturn(Optional.of(company));
        when(cashRegisterRepository.findByCompanyIdAndStatus(
            eq(1L), eq(CashRegisterStatus.OPEN)))
            .thenReturn(Optional.empty());

        CreateExpenseRequest request =
            new CreateExpenseRequest();
        request.setAmount(new BigDecimal("50000"));
        request.setCategory(ExpenseCategory.SUPPLIES);
        request.setPaymentMethod(PaymentMethod.CASH);

        assertThrows(ResourceNotFoundException.class,
            () -> expenseService.create(1L, request));
    }

    @Test
    void findById_expense_found() {
        Expense expense = new Expense();
        expense.setId(1L);
        expense.setCompany(company);
        expense.setCashRegister(cashRegister);
        expense.setAmount(new BigDecimal("30000"));
        expense.setCategory(ExpenseCategory.UTILITIES);

        when(expenseRepository.findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(expense));

        var response = expenseService.findById(1L, 1L);

        assertNotNull(response);
        assertEquals(new BigDecimal("30000"),
            response.getAmount());
        assertEquals(ExpenseCategory.UTILITIES,
            response.getCategory());
    }

    @Test
    void findById_expense_not_found() {
        when(expenseRepository.findByIdAndCompanyId(99L, 1L))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> expenseService.findById(1L, 99L));
    }

    @Test
    void findAllByCompany_success() {
        Expense expense = new Expense();
        expense.setId(1L);
        expense.setCompany(company);
        expense.setCashRegister(cashRegister);
        expense.setAmount(new BigDecimal("30000"));

        when(companyRepository.findById(1L))
            .thenReturn(Optional.of(company));
        when(expenseRepository.findAllByCompanyId(1L))
            .thenReturn(Arrays.asList(expense));

        var response =
            expenseService.findAllByCompany(1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(new BigDecimal("30000"),
            response.get(0).getAmount());
    }

    @Test
    void findAllByCompany_empty() {
        when(companyRepository.findById(1L))
            .thenReturn(Optional.of(company));
        when(expenseRepository.findAllByCompanyId(1L))
            .thenReturn(Collections.emptyList());

        var response =
            expenseService.findAllByCompany(1L);

        assertNotNull(response);
        assertTrue(response.isEmpty());
    }

    @Test
    void findAllByCompany_company_not_found() {
        when(companyRepository.findById(99L))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> expenseService.findAllByCompany(99L));
    }

    @Test
    void findAllByCashRegister_success() {
        Expense expense = new Expense();
        expense.setId(1L);
        expense.setCompany(company);
        expense.setCashRegister(cashRegister);
        expense.setAmount(new BigDecimal("15000"));

        when(cashRegisterRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(cashRegister));
        when(expenseRepository
            .findAllByCashRegisterId(1L))
            .thenReturn(Arrays.asList(expense));

        var response =
            expenseService.findAllByCashRegister(1L, 1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(new BigDecimal("15000"),
            response.get(0).getAmount());
    }

    @Test
    void findAllByCashRegister_not_found() {
        when(cashRegisterRepository
            .findByIdAndCompanyId(99L, 1L))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> expenseService
                .findAllByCashRegister(1L, 99L));
    }
}
