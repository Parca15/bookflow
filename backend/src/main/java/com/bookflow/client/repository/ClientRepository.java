package com.bookflow.client.repository;

import com.bookflow.client.entity.Client;
import com.bookflow.client.entity.ClientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {

    boolean existsByCompanyIdAndDocumentNumber(
        Long companyId,
        String documentNumber
    );

    Optional<Client> findByCompanyIdAndDocumentNumber(
        Long companyId,
        String documentNumber
    );

    List<Client> findAllByCompanyIdAndStatus(
        Long companyId,
        ClientStatus status
    );

    boolean existsByCompanyIdAndDocumentNumberAndIdNot(
        Long companyId,
        String documentNumber,
        Long id
    );

    Optional<Client> findByIdAndCompanyId(
        Long id,
        Long companyId
    );

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM payments WHERE appointment_id IN (SELECT id FROM appointments WHERE client_id = :clientId)
        """, nativeQuery = true)
    void deletePaymentsByClientId(@Param("clientId") Long clientId);

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM appointment_items WHERE appointment_id IN (SELECT id FROM appointments WHERE client_id = :clientId)
        """, nativeQuery = true)
    void deleteAppointmentItemsByClientId(@Param("clientId") Long clientId);

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM invoices WHERE appointment_id IN (SELECT id FROM appointments WHERE client_id = :clientId)
        """, nativeQuery = true)
    void deleteInvoicesByClientId(@Param("clientId") Long clientId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM appointments WHERE client_id = :clientId", nativeQuery = true)
    void deleteAppointmentsByClientId(@Param("clientId") Long clientId);
}