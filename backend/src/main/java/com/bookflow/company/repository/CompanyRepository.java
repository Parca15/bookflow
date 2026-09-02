package com.bookflow.company.repository;

import com.bookflow.company.entity.Company;
import com.bookflow.company.entity.CompanyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    boolean existsByDocumentNumber(String documentNumber);

    List<Company> findAllByStatus(CompanyStatus status);

    boolean existsByDocumentNumberAndIdNot(String documentNumber, Long id);

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM payments WHERE appointment_id IN (SELECT id FROM appointments WHERE company_id = :companyId)
        """, nativeQuery = true)
    void deletePaymentsByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM appointment_items WHERE appointment_id IN (SELECT id FROM appointments WHERE company_id = :companyId)
        """, nativeQuery = true)
    void deleteAppointmentItemsByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM invoices WHERE appointment_id IN (SELECT id FROM appointments WHERE company_id = :companyId)
        """, nativeQuery = true)
    void deleteInvoicesByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM appointments WHERE company_id = :companyId", nativeQuery = true)
    void deleteAppointmentsByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM expenses WHERE company_id = :companyId", nativeQuery = true)
    void deleteExpensesByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM cash_registers WHERE company_id = :companyId", nativeQuery = true)
    void deleteCashRegistersByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM promotions WHERE company_id = :companyId", nativeQuery = true)
    void deletePromotionsByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM catalog WHERE company_id = :companyId", nativeQuery = true)
    void deleteCatalogByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM schedules WHERE employee_id IN (SELECT id FROM employees WHERE company_id = :companyId)
        """, nativeQuery = true)
    void deleteSchedulesByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM employees WHERE company_id = :companyId", nativeQuery = true)
    void deleteEmployeesByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM clients WHERE company_id = :companyId", nativeQuery = true)
    void deleteClientsByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles WHERE company_id = :companyId)
        """, nativeQuery = true)
    void deleteRolePermissionsByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM roles WHERE company_id = :companyId", nativeQuery = true)
    void deleteRolesByCompanyId(@Param("companyId") Long companyId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM users WHERE company_id = :companyId", nativeQuery = true)
    void deleteUsersByCompanyId(@Param("companyId") Long companyId);
}
