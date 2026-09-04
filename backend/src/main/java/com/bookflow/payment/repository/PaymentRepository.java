package com.bookflow.payment.repository;

import com.bookflow.payment.entity.Payment;
import com.bookflow.payment.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface PaymentRepository
    extends JpaRepository<Payment, Long> {

    Optional<Payment> findByIdAndAppointmentCompanyId(
        Long id,
        Long companyId
    );

    List<Payment> findAllByAppointmentId(
        Long appointmentId
    );

    List<Payment> findAllByAppointmentIdIn(
        List<Long> appointmentIds
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.appointment.id = :appointmentId
        AND p.appointment.status <> com.bookflow.appointment.entity.AppointmentStatus.CANCELLED
    """)
    BigDecimal calculateTotalByAppointmentId(
        @Param("appointmentId") Long appointmentId
    );

    List<Payment> findAllByCashRegisterId(
        Long cashRegisterId
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.cashRegister.id = :cashRegisterId
        AND p.paymentMethod = :paymentMethod
        AND p.appointment.status <> com.bookflow.appointment.entity.AppointmentStatus.CANCELLED
    """)
    BigDecimal sumAmountByCashRegisterAndMethod(
        @Param("cashRegisterId") Long cashRegisterId,
        @Param("paymentMethod") PaymentMethod paymentMethod
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.cashRegister.id = :cashRegisterId
        AND p.appointment.status <> com.bookflow.appointment.entity.AppointmentStatus.CANCELLED
    """)
    BigDecimal sumAmountByCashRegister(
        @Param("cashRegisterId") Long cashRegisterId
    );

    @Query("""
        SELECT p.paymentMethod, COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.cashRegister.id = :cashRegisterId
        AND p.appointment.status <> com.bookflow.appointment.entity.AppointmentStatus.CANCELLED
        GROUP BY p.paymentMethod
    """)
    Map<PaymentMethod, BigDecimal> sumAmountsByMethodForCashRegister(
        @Param("cashRegisterId") Long cashRegisterId
    );
}