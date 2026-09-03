package com.bookflow.employee.controller;

import com.bookflow.employee.dto.request.CreateEmployeeRequest;
import com.bookflow.employee.dto.request.UpdateEmployeeRequest;
import com.bookflow.employee.dto.response.EmployeeResponse;
import com.bookflow.employee.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping("/companies/{companyId}/employees")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public EmployeeResponse create(
        @PathVariable Long companyId,
        @Valid @RequestBody CreateEmployeeRequest request
    ) {
        return employeeService.create(companyId, request);
    }

    @GetMapping("/companies/{companyId}/employees/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST') or hasRole('EMPLOYEE')")
    public EmployeeResponse findById(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {
        return employeeService.findById(companyId, id);
    }

    @GetMapping("/companies/{companyId}/employees/document/{documentNumber}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public EmployeeResponse findByDocument(
        @PathVariable Long companyId,
        @PathVariable String documentNumber
    ) {
        return employeeService.findByDocument(
            companyId,
            documentNumber
        );
    }

    @GetMapping("/companies/{companyId}/employees")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public List<EmployeeResponse> findAllByCompany(
        @PathVariable Long companyId
    ) {
        return employeeService.findAllByCompany(companyId);
    }

    @GetMapping("/companies/{companyId}/employees/paged")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public Page<EmployeeResponse> findAllByCompanyPaged(
        @PathVariable Long companyId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return employeeService.findAllByCompanyPaged(companyId, pageable);
    }

    @GetMapping("/employees")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<EmployeeResponse> findAll() {
        return employeeService.findAll();
    }

    @GetMapping("/employees/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<EmployeeResponse> findAllIncludingInactive() {
        return employeeService.findAllIncludingInactive();
    }

    @PutMapping("/companies/{companyId}/employees/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public EmployeeResponse update(
        @PathVariable Long companyId,
        @PathVariable Long id,
        @Valid @RequestBody UpdateEmployeeRequest request
    ) {
        return employeeService.update(companyId, id, request);
    }

    @DeleteMapping("/companies/{companyId}/employees/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public void delete(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {
        employeeService.delete(companyId, id);
    }

    @PatchMapping("/companies/{companyId}/employees/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public void activate(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {
        employeeService.activate(companyId, id);
    }
}
