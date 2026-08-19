package com.bookflow.employee.service.impl;

import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.employee.dto.request.CreateEmployeeRequest;
import com.bookflow.employee.dto.request.UpdateEmployeeRequest;
import com.bookflow.employee.dto.response.EmployeeResponse;
import com.bookflow.employee.entity.Employee;
import com.bookflow.employee.entity.EmployeeStatus;
import com.bookflow.employee.mapper.EmployeeMapper;
import com.bookflow.employee.repository.EmployeeRepository;
import com.bookflow.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final CompanyRepository companyRepository;

    @Override
    public EmployeeResponse create(
        Long companyId,
        CreateEmployeeRequest request
    ) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + companyId
                )
            );

        if (request.getDocumentNumber() != null &&
            employeeRepository.existsByCompanyIdAndDocumentNumber(
                companyId,
                request.getDocumentNumber()
            )) {

            throw new ResourceAlreadyExistsException(
                "Ya existe un empleado con ese documento en la empresa."
            );
        }

        Employee employee = employeeMapper.toEntity(request);

        employee.setCompany(company);

        employee = employeeRepository.save(employee);

        return employeeMapper.toResponse(employee);
    }

    @Override
    public EmployeeResponse findById(Long id) {

        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el empleado con id: " + id
                )
            );

        return employeeMapper.toResponse(employee);
    }

    @Override
    public EmployeeResponse findByDocument(
        Long companyId,
        String documentNumber
    ) {

        Employee employee = employeeRepository
            .findByCompanyIdAndDocumentNumber(
                companyId,
                documentNumber
            )
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró un empleado con el documento: "
                        + documentNumber
                )
            );

        return employeeMapper.toResponse(employee);
    }

    @Override
    public List<EmployeeResponse> findAllByCompany(Long companyId) {

        companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + companyId
                )
            );

        return employeeRepository
            .findAllByCompanyIdAndStatus(
                companyId,
                EmployeeStatus.ACTIVE
            )
            .stream()
            .map(employeeMapper::toResponse)
            .toList();
    }

    @Override
    public List<EmployeeResponse> findAll() {

        return employeeRepository.findAll()
            .stream()
            .map(employeeMapper::toResponse)
            .toList();
    }

    @Override
    public List<EmployeeResponse> findAllIncludingInactive() {

        return employeeRepository.findAll()
            .stream()
            .map(employeeMapper::toResponse)
            .toList();
    }

    @Override
    public EmployeeResponse update(
        Long id,
        UpdateEmployeeRequest request
    ) {

        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el empleado con id: " + id
                )
            );

        Long companyId = employee.getCompany().getId();

        if (request.getDocumentNumber() != null &&
            employeeRepository.existsByCompanyIdAndDocumentNumberAndIdNot(
                companyId,
                request.getDocumentNumber(),
                id
            )) {

            throw new ResourceAlreadyExistsException(
                "Ya existe otro empleado con ese documento en la empresa."
            );
        }

        employeeMapper.updateEntity(request, employee);

        employee = employeeRepository.save(employee);

        return employeeMapper.toResponse(employee);
    }

    @Override
    public void delete(Long id) {

        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el empleado con id: " + id
                )
            );

        employee.setStatus(EmployeeStatus.INACTIVE);

        employeeRepository.save(employee);
    }

    @Override
    public void activate(Long id) {

        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el empleado con id: " + id
                )
            );

        employee.setStatus(EmployeeStatus.ACTIVE);

        employeeRepository.save(employee);
    }
}
