package com.bookflow.cash.service;

import com.bookflow.cash.dto.request.OpenCashRegisterRequest;
import com.bookflow.cash.dto.request.CloseCashRegisterRequest;
import com.bookflow.cash.entity.CashRegister;
import com.bookflow.cash.entity.CashRegisterStatus;
import com.bookflow.cash.repository.CashRegisterRepository;
import com.bookflow.cash.service.impl.CashRegisterServiceImpl;
import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.entity.CompanyStatus;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.expense.dto.response.ExpenseResponse;
import com.bookflow.expense.entity.Expense;
import com.bookflow.expense.mapper.ExpenseMapper;
import com.bookflow.expense.repository.ExpenseRepository;
import com.bookflow.payment.dto.response.PaymentResponse;
import com.bookflow.payment.entity.Payment;
import com.bookflow.payment.entity.PaymentMethod;
import com.bookflow.payment.mapper.PaymentMapper;
import com.bookflow.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CashRegisterServiceImplTest {

    @Mock
    private CashRegisterRepository cashRegisterRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private ExpenseMapper expenseMapper;

    @InjectMocks
    private CashRegisterServiceImpl cashRegisterService;

    private Company company;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);
        company.setBusinessName("Test Company");
        company.setStatus(CompanyStatus.ACTIVE);

        lenient().when(paymentMapper.toResponse(any(Payment.class)))
            .thenAnswer(invocation -> {
                Payment p = invocation.getArgument(0);
                PaymentResponse r = new PaymentResponse();
                r.setId(p.getId());
                r.setAmount(p.getAmount());
                r.setPaymentMethod(p.getPaymentMethod());
                return r;
            });

        lenient().when(expenseMapper.toResponse(any(Expense.class)))
            .thenAnswer(invocation -> {
                Expense e = invocation.getArgument(0);
                ExpenseResponse r = new ExpenseResponse();
                r.setId(e.getId());
                r.setAmount(e.getAmount());
                return r;
            });

        lenient().when(paymentRepository.findAllByCashRegisterId(anyLong()))
            .thenReturn(List.of());
        lenient().when(expenseRepository.findAllByCashRegisterId(anyLong()))
            .thenReturn(List.of());
    }

    @Test
    void open_cash_register_success() {
        when(companyRepository.findById(1L))
            .thenReturn(Optional.of(company));
        when(cashRegisterRepository
            .findByCompanyIdAndStatus(
                eq(1L), eq(CashRegisterStatus.OPEN)))
            .thenReturn(Optional.empty());
        when(cashRegisterRepository.save(
            any(CashRegister.class)))
            .thenAnswer(invocation -> {
                CashRegister cr =
                    invocation.getArgument(0);
                cr.setId(1L);
                return cr;
            });
        when(paymentRepository
            .sumAmountsByMethodForCashRegister(1L))
            .thenReturn(List.of());
        when(expenseRepository
            .sumAmountsByMethodForCashRegister(1L))
            .thenReturn(List.of());

        OpenCashRegisterRequest request =
            new OpenCashRegisterRequest();
        request.setOpeningAmount(new BigDecimal("100000"));

        var response =
            cashRegisterService.open(1L, request);

        assertNotNull(response);
        assertEquals(CashRegisterStatus.OPEN,
            response.getStatus());
        assertEquals(new BigDecimal("100000"),
            response.getOpeningAmount());
        assertEquals(1L, response.getId());
    }

    @Test
    void open_cash_register_already_open() {
        when(companyRepository.findById(1L))
            .thenReturn(Optional.of(company));
        when(cashRegisterRepository
            .findByCompanyIdAndStatus(
                eq(1L), eq(CashRegisterStatus.OPEN)))
            .thenReturn(Optional.of(new CashRegister()));

        OpenCashRegisterRequest request =
            new OpenCashRegisterRequest();
        request.setOpeningAmount(new BigDecimal("100000"));

        assertThrows(ResourceAlreadyExistsException.class,
            () -> cashRegisterService.open(1L, request));
    }

    @Test
    void open_cash_register_company_not_found() {
        when(companyRepository.findById(99L))
            .thenReturn(Optional.empty());

        OpenCashRegisterRequest request =
            new OpenCashRegisterRequest();
        request.setOpeningAmount(new BigDecimal("100000"));

        assertThrows(ResourceNotFoundException.class,
            () -> cashRegisterService.open(99L, request));
    }

    @Test
    void findById_cash_register_found() {
        CashRegister cashRegister = new CashRegister();
        cashRegister.setId(1L);
        cashRegister.setCompany(company);
        cashRegister.setStatus(CashRegisterStatus.OPEN);

        when(cashRegisterRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(cashRegister));
        when(paymentRepository
            .sumAmountsByMethodForCashRegister(1L))
            .thenReturn(List.of());
        when(expenseRepository
            .sumAmountsByMethodForCashRegister(1L))
            .thenReturn(List.of());

        var response =
            cashRegisterService.findById(1L, 1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(CashRegisterStatus.OPEN,
            response.getStatus());
    }

    @Test
    void findById_cash_register_not_found() {
        when(cashRegisterRepository
            .findByIdAndCompanyId(99L, 1L))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> cashRegisterService.findById(1L, 99L));
    }

    @Test
    void close_cash_register_success() {
        CashRegister cashRegister = new CashRegister();
        cashRegister.setId(1L);
        cashRegister.setCompany(company);
        cashRegister.setOpeningAmount(
            new BigDecimal("100000"));
        cashRegister.setStatus(CashRegisterStatus.OPEN);

        when(cashRegisterRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(cashRegister));
        when(paymentRepository
            .sumAmountByCashRegisterAndMethod(
                eq(1L), eq(PaymentMethod.CASH)))
            .thenReturn(new BigDecimal("50000"));
        when(paymentRepository
            .sumAmountsByMethodForCashRegister(1L))
            .thenReturn(java.util.List.<Object[]>of(new Object[]{PaymentMethod.CASH, new BigDecimal("50000")}));
        when(expenseRepository
            .sumAmountByCashRegisterAndMethod(
                eq(1L), eq(PaymentMethod.CASH)))
            .thenReturn(new BigDecimal("10000"));
        when(expenseRepository
            .sumAmountsByMethodForCashRegister(1L))
            .thenReturn(java.util.List.<Object[]>of(new Object[]{PaymentMethod.CASH, new BigDecimal("10000")}));
        when(cashRegisterRepository.save(
            any(CashRegister.class)))
            .thenAnswer(invocation ->
                invocation.getArgument(0));

        CloseCashRegisterRequest request =
            new CloseCashRegisterRequest();
        request.setClosingAmount(
            new BigDecimal("140000"));

        var response =
            cashRegisterService.close(1L, 1L, request);

        assertNotNull(response);
        assertEquals(CashRegisterStatus.CLOSED,
            response.getStatus());
        assertEquals(new BigDecimal("140000"),
            response.getClosingAmount());
        // expectedCash = 100000 + 50000 - 10000 = 140000
        assertEquals(new BigDecimal("140000"),
            response.getExpectedCashAmount());
        // difference = 140000 - 140000 = 0
        assertEquals(0,
            response.getCashDifference()
                .compareTo(BigDecimal.ZERO));
    }

    @Test
    void close_cash_register_already_closed() {
        CashRegister cashRegister = new CashRegister();
        cashRegister.setId(1L);
        cashRegister.setCompany(company);
        cashRegister.setStatus(CashRegisterStatus.CLOSED);

        when(cashRegisterRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(cashRegister));

        CloseCashRegisterRequest request =
            new CloseCashRegisterRequest();
        request.setClosingAmount(
            new BigDecimal("140000"));

        assertThrows(ResourceAlreadyExistsException.class,
            () -> cashRegisterService.close(1L, 1L, request));
    }

    @Test
    void close_cash_register_with_difference() {
        CashRegister cashRegister = new CashRegister();
        cashRegister.setId(1L);
        cashRegister.setCompany(company);
        cashRegister.setOpeningAmount(
            new BigDecimal("100000"));
        cashRegister.setStatus(CashRegisterStatus.OPEN);

        when(cashRegisterRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(cashRegister));
        when(paymentRepository
            .sumAmountByCashRegisterAndMethod(
                eq(1L), eq(PaymentMethod.CASH)))
            .thenReturn(new BigDecimal("50000"));
        when(paymentRepository
            .sumAmountsByMethodForCashRegister(1L))
            .thenReturn(java.util.List.<Object[]>of(new Object[]{PaymentMethod.CASH, new BigDecimal("50000")}));
        when(expenseRepository
            .sumAmountByCashRegisterAndMethod(
                eq(1L), eq(PaymentMethod.CASH)))
            .thenReturn(BigDecimal.ZERO);
        when(expenseRepository
            .sumAmountsByMethodForCashRegister(1L))
            .thenReturn(List.of());
        when(cashRegisterRepository.save(
            any(CashRegister.class)))
            .thenAnswer(invocation ->
                invocation.getArgument(0));

        CloseCashRegisterRequest request =
            new CloseCashRegisterRequest();
        request.setClosingAmount(
            new BigDecimal("145000"));

        var response =
            cashRegisterService.close(1L, 1L, request);

        assertNotNull(response);
        // expectedCash = 100000 + 50000 - 0 = 150000
        assertEquals(new BigDecimal("150000"),
            response.getExpectedCashAmount());
        // difference = 145000 - 150000 = -5000
        assertEquals(new BigDecimal("-5000"),
            response.getCashDifference());
    }

    @Test
    void close_cash_register_not_found() {
        when(cashRegisterRepository
            .findByIdAndCompanyId(99L, 1L))
            .thenReturn(Optional.empty());

        CloseCashRegisterRequest request =
            new CloseCashRegisterRequest();
        request.setClosingAmount(
            new BigDecimal("140000"));

        assertThrows(ResourceNotFoundException.class,
            () -> cashRegisterService.close(1L, 99L, request));
    }

    @Test
    void findOpen_success() {
        CashRegister cashRegister = new CashRegister();
        cashRegister.setId(1L);
        cashRegister.setCompany(company);
        cashRegister.setOpeningAmount(
            new BigDecimal("100000"));
        cashRegister.setStatus(CashRegisterStatus.OPEN);

        when(cashRegisterRepository
            .findByCompanyIdAndStatus(
                eq(1L), eq(CashRegisterStatus.OPEN)))
            .thenReturn(Optional.of(cashRegister));
        when(paymentRepository
            .sumAmountsByMethodForCashRegister(1L))
            .thenReturn(List.of());
        when(expenseRepository
            .sumAmountsByMethodForCashRegister(1L))
            .thenReturn(List.of());

        var response =
            cashRegisterService.findOpen(1L);

        assertNotNull(response);
        assertEquals(CashRegisterStatus.OPEN,
            response.getStatus());
    }

    @Test
    void findOpen_no_open_register() {
        when(cashRegisterRepository
            .findByCompanyIdAndStatus(
                eq(1L), eq(CashRegisterStatus.OPEN)))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> cashRegisterService.findOpen(1L));
    }
}