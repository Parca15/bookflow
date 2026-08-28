package com.bookflow.cash.service.impl;

import com.bookflow.cash.dto.request.CloseCashRegisterRequest;
import com.bookflow.cash.dto.request.OpenCashRegisterRequest;
import com.bookflow.cash.dto.response.CashRegisterResponse;
import com.bookflow.cash.entity.CashRegister;
import com.bookflow.cash.entity.CashRegisterStatus;
import com.bookflow.cash.repository.CashRegisterRepository;
import com.bookflow.cash.service.CashRegisterService;
import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.expense.repository.ExpenseRepository;
import com.bookflow.payment.entity.PaymentMethod;
import com.bookflow.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CashRegisterServiceImpl
    implements CashRegisterService {

    private final CashRegisterRepository cashRegisterRepository;
    private final CompanyRepository companyRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    public CashRegisterResponse open(
        Long companyId,
        OpenCashRegisterRequest request
    ) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: "
                        + companyId
                )
            );

        cashRegisterRepository
            .findByCompanyIdAndStatus(
                companyId,
                CashRegisterStatus.OPEN
            )
            .ifPresent(cashRegister -> {
                throw new ResourceAlreadyExistsException(
                    "La empresa ya tiene una caja abierta."
                );
            });

        CashRegister cashRegister =
            new CashRegister();

        cashRegister.setCompany(company);
        cashRegister.setOpeningDate(
            LocalDateTime.now()
        );
        cashRegister.setOpeningAmount(
            request.getOpeningAmount()
        );
        cashRegister.setStatus(
            CashRegisterStatus.OPEN
        );

        cashRegister =
            cashRegisterRepository.save(cashRegister);

        return toResponse(cashRegister);
    }

    @Override
    @Transactional(readOnly = true)
    public CashRegisterResponse findOpen(
        Long companyId
    ) {

        CashRegister cashRegister =
            cashRegisterRepository
                .findByCompanyIdAndStatus(
                    companyId,
                    CashRegisterStatus.OPEN
                )
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "La empresa no tiene una caja abierta."
                    )
                );

        return toResponse(cashRegister);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CashRegisterResponse> findAllByCompany(
        Long companyId
    ) {

        companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: "
                        + companyId
                )
            );

        return cashRegisterRepository
            .findAllByCompanyIdOrderByOpeningDateDesc(
                companyId
            )
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CashRegisterResponse findById(
        Long companyId,
        Long cashRegisterId
    ) {

        CashRegister cashRegister =
            findCashRegister(companyId, cashRegisterId);

        return toResponse(cashRegister);
    }

    @Override
    public CashRegisterResponse close(
        Long companyId,
        Long cashRegisterId,
        CloseCashRegisterRequest request
    ) {

        CashRegister cashRegister =
            findCashRegister(companyId, cashRegisterId);

        if (cashRegister.getStatus() ==
            CashRegisterStatus.CLOSED) {

            throw new ResourceAlreadyExistsException(
                "La caja ya está cerrada."
            );
        }

        Long cashRegisterIdForCalc =
            cashRegister.getId();

        BigDecimal cashPayments =
            paymentRepository
                .sumAmountByCashRegisterAndMethod(
                    cashRegisterIdForCalc,
                    PaymentMethod.CASH
                );

        BigDecimal cashExpenses =
            expenseRepository
                .sumAmountByCashRegisterAndMethod(
                    cashRegisterIdForCalc,
                    PaymentMethod.CASH
                );

        BigDecimal expectedCash =
            cashRegister.getOpeningAmount()
                .add(cashPayments)
                .subtract(cashExpenses);

        BigDecimal closingAmount =
            request.getClosingAmount();

        BigDecimal difference =
            closingAmount.subtract(expectedCash);

        cashRegister.setClosingDate(
            LocalDateTime.now()
        );

        cashRegister.setClosingAmount(
            closingAmount
        );

        cashRegister.setExpectedCashAmount(
            expectedCash
        );

        cashRegister.setCashDifference(
            difference
        );

        cashRegister.setStatus(
            CashRegisterStatus.CLOSED
        );

        cashRegister =
            cashRegisterRepository.save(cashRegister);

        return toResponse(cashRegister);
    }

    private CashRegister findCashRegister(
        Long companyId,
        Long cashRegisterId
    ) {

        return cashRegisterRepository
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
    }

    private CashRegisterResponse toResponse(
        CashRegister cashRegister
    ) {

        CashRegisterResponse response =
            new CashRegisterResponse();

        response.setId(
            cashRegister.getId()
        );

        response.setCompanyId(
            cashRegister.getCompany().getId()
        );

        response.setOpeningDate(
            cashRegister.getOpeningDate()
        );

        response.setClosingDate(
            cashRegister.getClosingDate()
        );

        response.setOpeningAmount(
            cashRegister.getOpeningAmount()
        );

        response.setClosingAmount(
            cashRegister.getClosingAmount()
        );

        response.setExpectedCashAmount(
            cashRegister.getExpectedCashAmount()
        );

        response.setCashDifference(
            cashRegister.getCashDifference()
        );

        response.setStatus(
            cashRegister.getStatus()
        );

        Long cashRegisterId = cashRegister.getId();

        response.setTotalCashPayments(
            paymentRepository
                .sumAmountByCashRegisterAndMethod(
                    cashRegisterId,
                    PaymentMethod.CASH
                )
        );

        response.setTotalCardPayments(
            paymentRepository
                .sumAmountByCashRegisterAndMethod(
                    cashRegisterId,
                    PaymentMethod.CARD
                )
        );

        response.setTotalTransferPayments(
            paymentRepository
                .sumAmountByCashRegisterAndMethod(
                    cashRegisterId,
                    PaymentMethod.TRANSFER
                )
        );

        response.setTotalOtherPayments(
            paymentRepository
                .sumAmountByCashRegisterAndMethod(
                    cashRegisterId,
                    PaymentMethod.OTHER
                )
        );

        response.setTotalPayments(
            paymentRepository.sumAmountByCashRegister(
                cashRegisterId
            )
        );

        response.setTotalCashExpenses(
            expenseRepository
                .sumAmountByCashRegisterAndMethod(
                    cashRegisterId,
                    PaymentMethod.CASH
                )
        );

        response.setTotalCardExpenses(
            expenseRepository
                .sumAmountByCashRegisterAndMethod(
                    cashRegisterId,
                    PaymentMethod.CARD
                )
        );

        response.setTotalTransferExpenses(
            expenseRepository
                .sumAmountByCashRegisterAndMethod(
                    cashRegisterId,
                    PaymentMethod.TRANSFER
                )
        );

        response.setTotalOtherExpenses(
            expenseRepository
                .sumAmountByCashRegisterAndMethod(
                    cashRegisterId,
                    PaymentMethod.OTHER
                )
        );

        response.setTotalExpenses(
            expenseRepository.sumAmountByCashRegister(
                cashRegisterId
            )
        );

        BigDecimal totalPayments =
            paymentRepository.sumAmountByCashRegister(
                cashRegisterId
            );

        BigDecimal totalExpenses =
            expenseRepository.sumAmountByCashRegister(
                cashRegisterId
            );

        response.setNetResult(
            totalPayments.subtract(totalExpenses)
        );

        return response;
    }
}
