package com.bookflow.company.service.impl;

import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.dto.request.CreateCompanyRequest;
import com.bookflow.company.dto.request.UpdateCompanyRequest;
import com.bookflow.company.dto.response.CompanyResponse;
import com.bookflow.company.entity.Company;
import com.bookflow.company.mapper.CompanyMapper;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.company.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.bookflow.company.entity.CompanyStatus;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    @Override
    public CompanyResponse create(CreateCompanyRequest request) {

        if (request.getDocumentNumber() != null &&
            companyRepository.existsByDocumentNumber(request.getDocumentNumber())) {

            throw new ResourceAlreadyExistsException(
                "Ya existe una empresa con ese documento."
            );
        }

        Company company = companyMapper.toEntity(request);

        company = companyRepository.save(company);

        return companyMapper.toResponse(company);
    }

    @Override
    public CompanyResponse findById(Long id) {

        Company company = companyRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + id
                )
            );

        return companyMapper.toResponse(company);
    }

    @Override
    public List<CompanyResponse> findAll() {
        return companyRepository.findAllByStatus(CompanyStatus.ACTIVE)
            .stream()
            .map(companyMapper::toResponse)
            .toList();
    }

    @Override
    public CompanyResponse update(Long id, UpdateCompanyRequest request) {

        Company company = companyRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + id
                )
            );

        if (request.getDocumentNumber() != null &&
            companyRepository.existsByDocumentNumberAndIdNot(
                request.getDocumentNumber(),
                id)) {

            throw new ResourceAlreadyExistsException(
                "Ya existe otra empresa con ese documento."
            );
        }

        companyMapper.updateEntity(request, company);

        company = companyRepository.save(company);

        return companyMapper.toResponse(company);
    }

    @Override
    public void delete(Long id) {

        Company company = companyRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + id
                )
            );

        company.setStatus(CompanyStatus.INACTIVE);

        companyRepository.save(company);
    }

    @Override
    public List<CompanyResponse> findAllCompanies() {

        return companyRepository.findAll()
            .stream()
            .map(companyMapper::toResponse)
            .toList();
    }

    @Override
    public void activate(Long id) {

        Company company = companyRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + id
                )
            );

        company.setStatus(CompanyStatus.ACTIVE);

        companyRepository.save(company);
    }
}
