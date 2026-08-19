package com.bookflow.employee.service;

import com.bookflow.employee.dto.request.CreateEmployeeRequest;
import com.bookflow.employee.dto.request.UpdateEmployeeRequest;
import com.bookflow.employee.dto.response.EmployeeResponse;

import java.util.List;

public interface EmployeeService {

    EmployeeResponse create(
        Long companyId,
        CreateEmployeeRequest request
    );

    EmployeeResponse findById(Long id);

    EmployeeResponse findByDocument(
        Long companyId,
        String documentNumber
    );

    List<EmployeeResponse> findAllByCompany(Long companyId);

    List<EmployeeResponse> findAll();

    List<EmployeeResponse> findAllIncludingInactive();

    EmployeeResponse update(
        Long id,
        UpdateEmployeeRequest request
    );

    void delete(Long id);

    void activate(Long id);
}
