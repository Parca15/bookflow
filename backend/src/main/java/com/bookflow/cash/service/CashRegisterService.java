package com.bookflow.cash.service;

import com.bookflow.cash.dto.request.CloseCashRegisterRequest;
import com.bookflow.cash.dto.request.OpenCashRegisterRequest;
import com.bookflow.cash.dto.response.CashRegisterResponse;

import java.util.List;

public interface CashRegisterService {

    CashRegisterResponse open(
        Long companyId,
        OpenCashRegisterRequest request
    );

    CashRegisterResponse findOpen(
        Long companyId
    );

    List<CashRegisterResponse> findAllByCompany(
        Long companyId
    );

    CashRegisterResponse findById(
        Long companyId,
        Long cashRegisterId
    );

    CashRegisterResponse close(
        Long companyId,
        Long cashRegisterId,
        CloseCashRegisterRequest request
    );
}
