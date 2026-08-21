package com.bookflow.payment.repository;

import com.bookflow.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    List<Payment> findAllByAppointmentId(
        Long appointmentId
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.appointment.id = :appointmentId
    """)
    BigDecimal calculateTotalByAppointmentId(
        @Param("appointmentId") Long appointmentId
    );
}