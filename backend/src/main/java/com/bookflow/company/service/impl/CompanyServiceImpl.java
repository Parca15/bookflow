package com.bookflow.company.service.impl;

import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.dto.request.CreateCompanyRequest;
import com.bookflow.company.dto.response.CompanyResponse;
import com.bookflow.company.entity.Company;
import com.bookflow.company.mapper.CompanyMapper;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.company.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
            .orElseThrow(() -> new ResourceNotFoundException(
                "Empresa con id " + id + " no encontrada."
            ));

        return companyMapper.toResponse(company);
    }

    @Override
    public List<CompanyResponse> findAll() {

        List<Company> companies = companyRepository.findAll();

        return companyMapper.toResponseList(companies);
    }

}
