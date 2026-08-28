package com.bookflow.cash.repository;

import com.bookflow.cash.entity.CashRegister;
import com.bookflow.cash.entity.CashRegisterStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CashRegisterRepository
    extends JpaRepository<CashRegister, Long> {

    Optional<CashRegister> findByIdAndCompanyId(
        Long id,
        Long companyId
    );

    Optional<CashRegister> findByCompanyIdAndStatus(
        Long companyId,
        CashRegisterStatus status
    );

    List<CashRegister> findAllByCompanyIdOrderByOpeningDateDesc(
        Long companyId
    );
}