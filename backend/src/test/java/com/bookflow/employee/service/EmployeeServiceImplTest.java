package com.bookflow.employee.service;

import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.employee.dto.request.CreateEmployeeRequest;
import com.bookflow.employee.dto.response.EmployeeResponse;
import com.bookflow.employee.entity.Employee;
import com.bookflow.employee.entity.EmployeeStatus;
import com.bookflow.employee.mapper.EmployeeMapper;
import com.bookflow.employee.repository.EmployeeRepository;
import com.bookflow.employee.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock private EmployeeRepository employeeRepository;
    @Mock private EmployeeMapper employeeMapper;
    @Mock private CompanyRepository companyRepository;
    @InjectMocks private EmployeeServiceImpl employeeService;

    private Company company;
    private Employee employee;
    private EmployeeResponse employeeResponse;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);

        employee = new Employee();
        employee.setId(20L);
        employee.setCompany(company);
        employee.setName("María López");
        employee.setPosition("Estilista");
        employee.setStatus(EmployeeStatus.ACTIVE);

        employeeResponse = new EmployeeResponse();
        employeeResponse.setId(20L);
        employeeResponse.setName("María López");
        employeeResponse.setPosition("Estilista");
    }

    @Test
    void create_success() {
        CreateEmployeeRequest req = new CreateEmployeeRequest();
        req.setName("María López");
        req.setPosition("Estilista");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(employeeMapper.toEntity(any())).thenReturn(employee);
        when(employeeRepository.save(any())).thenReturn(employee);
        when(employeeMapper.toResponse(any())).thenReturn(employeeResponse);

        EmployeeResponse result = employeeService.create(1L, req);

        assertNotNull(result);
        assertEquals("María López", result.getName());
    }

    @Test
    void create_duplicateDocument_throws() {
        CreateEmployeeRequest req = new CreateEmployeeRequest();
        req.setDocumentNumber("99999");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(employeeRepository.existsByCompanyIdAndDocumentNumber(1L, "99999")).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> employeeService.create(1L, req));
    }

    @Test
    void findById_found() {
        when(employeeRepository.findByIdAndCompanyId(20L, 1L)).thenReturn(Optional.of(employee));
        when(employeeMapper.toResponse(employee)).thenReturn(employeeResponse);

        EmployeeResponse result = employeeService.findById(1L, 20L);

        assertEquals(20L, result.getId());
    }

    @Test
    void findById_notFound_throws() {
        when(employeeRepository.findByIdAndCompanyId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.findById(1L, 99L));
    }

    @Test
    void findAllByCompany_returnsActive() {
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(employeeRepository.findAllByCompanyIdAndStatus(1L, EmployeeStatus.ACTIVE))
            .thenReturn(List.of(employee));
        when(employeeMapper.toResponse(employee)).thenReturn(employeeResponse);

        List<EmployeeResponse> result = employeeService.findAllByCompany(1L);

        assertEquals(1, result.size());
    }

    @Test
    void delete_setsInactive() {
        when(employeeRepository.findByIdAndCompanyId(20L, 1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any())).thenReturn(employee);

        employeeService.delete(1L, 20L);

        assertEquals(EmployeeStatus.INACTIVE, employee.getStatus());
    }
}
