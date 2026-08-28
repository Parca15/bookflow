package com.bookflow.integration;

import com.bookflow.auth.dto.request.RegisterRequest;
import com.bookflow.auth.dto.response.AuthResponse;
import com.bookflow.auth.entity.UserRole;
import com.bookflow.auth.service.AuthService;
import com.bookflow.company.entity.Company;
import com.bookflow.company.entity.CompanyStatus;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.expense.service.ExpenseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MultiTenantIsolationTest {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private ExpenseService expenseService;

    private Company companyA;
    private Company companyB;

    @BeforeEach
    void setUp() {
        companyA = new Company();
        companyA.setBusinessName("Company A");
        companyA.setDocumentNumber("DOC-001-A");
        companyA.setStatus(CompanyStatus.ACTIVE);
        companyA = companyRepository.save(companyA);

        companyB = new Company();
        companyB.setBusinessName("Company B");
        companyB.setDocumentNumber("DOC-001-B");
        companyB.setStatus(CompanyStatus.ACTIVE);
        companyB = companyRepository.save(companyB);
    }

    @Test
    void user_cannot_access_other_company_expense() {

        assertThrows(ResourceNotFoundException.class,
            () -> expenseService.findById(
                companyB.getId(),
                999L
            )
        );
    }

    @Test
    void register_users_in_different_companies() {

        RegisterRequest regA = new RegisterRequest();
        regA.setCompanyId(companyA.getId());
        regA.setEmail("admin@companyA.com");
        regA.setPassword("123456");
        regA.setFullName("Admin A");
        regA.setRole(UserRole.ADMIN);

        RegisterRequest regB = new RegisterRequest();
        regB.setCompanyId(companyB.getId());
        regB.setEmail("admin@companyB.com");
        regB.setPassword("123456");
        regB.setFullName("Admin B");
        regB.setRole(UserRole.ADMIN);

        AuthResponse responseA =
            authService.register(regA);
        AuthResponse responseB =
            authService.register(regB);

        assertNotEquals(
            responseA.getUserId(),
            responseB.getUserId()
        );
        assertEquals(companyA.getId(),
            responseA.getCompanyId());
        assertEquals(companyB.getId(),
            responseB.getCompanyId());
    }

    @Test
    void duplicate_email_across_companies_allowed() {

        RegisterRequest regA = new RegisterRequest();
        regA.setCompanyId(companyA.getId());
        regA.setEmail("shared@test.com");
        regA.setPassword("123456");
        regA.setFullName("User A");
        regA.setRole(UserRole.ADMIN);

        RegisterRequest regB = new RegisterRequest();
        regB.setCompanyId(companyB.getId());
        regB.setEmail("shared@test.com");
        regB.setPassword("123456");
        regB.setFullName("User B");
        regB.setRole(UserRole.ADMIN);

        AuthResponse responseA =
            authService.register(regA);
        AuthResponse responseB =
            authService.register(regB);

        assertNotEquals(
            responseA.getUserId(),
            responseB.getUserId()
        );
    }

    @Test
    void duplicate_email_within_same_company_rejected() {

        RegisterRequest reg1 = new RegisterRequest();
        reg1.setCompanyId(companyA.getId());
        reg1.setEmail("admin@companyA.com");
        reg1.setPassword("123456");
        reg1.setFullName("Admin 1");
        reg1.setRole(UserRole.ADMIN);

        RegisterRequest reg2 = new RegisterRequest();
        reg2.setCompanyId(companyA.getId());
        reg2.setEmail("admin@companyA.com");
        reg2.setPassword("654321");
        reg2.setFullName("Admin 2");
        reg2.setRole(UserRole.MANAGER);

        authService.register(reg1);

        assertThrows(
            ResourceAlreadyExistsException.class,
            () -> authService.register(reg2)
        );
    }

    @Test
    void register_user_nonexistent_company_rejected() {

        RegisterRequest reg = new RegisterRequest();
        reg.setCompanyId(9999L);
        reg.setEmail("ghost@test.com");
        reg.setPassword("123456");
        reg.setFullName("Ghost User");
        reg.setRole(UserRole.ADMIN);

        assertThrows(ResourceNotFoundException.class,
            () -> authService.register(reg));
    }
}
