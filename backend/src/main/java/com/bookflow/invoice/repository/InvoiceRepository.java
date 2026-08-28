package com.bookflow.invoice.repository;

import com.bookflow.invoice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByAppointmentId(
        Long appointmentId
    );

    boolean existsByAppointmentId(
        Long appointmentId
    );

    @Query(
        "SELECT i FROM Invoice i " +
        "JOIN i.appointment a " +
        "WHERE i.id = :id " +
        "AND a.company.id = :companyId"
    )
    Optional<Invoice> findByIdAndCompanyId(
        @Param("id") Long id,
        @Param("companyId") Long companyId
    );

    @Query(
        "SELECT i FROM Invoice i " +
        "JOIN i.appointment a " +
        "WHERE a.id = :appointmentId " +
        "AND a.company.id = :companyId"
    )
    Optional<Invoice> findByAppointmentIdAndCompanyId(
        @Param("appointmentId") Long appointmentId,
        @Param("companyId") Long companyId
    );
}