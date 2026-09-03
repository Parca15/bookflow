package com.bookflow.expense.repository;

import com.bookflow.expense.entity.Expense;
import com.bookflow.payment.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository
    extends JpaRepository<Expense, Long> {

    Optional<Expense> findByIdAndCompanyId(
        Long id,
        Long companyId
    );

    List<Expense> findAllByCompanyId(Long companyId);

    List<Expense> findAllByCashRegisterId(Long cashRegisterId);

    List<Expense> findAllByCompanyIdAndExpenseDateBetween(
        Long companyId,
        java.time.LocalDateTime start,
        java.time.LocalDateTime end
    );

    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.cashRegister.id = :cashRegisterId
    """)
    BigDecimal sumAmountByCashRegister(
        @Param("cashRegisterId") Long cashRegisterId
    );

    @Query("""
        SELECT COALESCE(SUM(e.amount), 0)
        FROM Expense e
        WHERE e.cashRegister.id = :cashRegisterId
        AND e.paymentMethod = :paymentMethod
    """)
    BigDecimal sumAmountByCashRegisterAndMethod(
        @Param("cashRegisterId") Long cashRegisterId,
        @Param("paymentMethod") PaymentMethod paymentMethod
    );
}
