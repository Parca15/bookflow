package com.bookflow.company.service.impl;

import com.bookflow.company.dto.request.CreateCompanyRequest;
import com.bookflow.company.dto.response.CompanyResponse;
import com.bookflow.company.entity.Company;
import com.bookflow.company.mapper.CompanyMapper;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.company.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    @Override
    public CompanyResponse create(CreateCompanyRequest request) {

        if (request.getDocumentNumber() != null &&
            companyRepository.existsByDocumentNumber(request.getDocumentNumber())) {
            throw new IllegalArgumentException("Ya existe una empresa con ese documento.");
        }

        Company company = companyMapper.toEntity(request);

        company = companyRepository.save(company);

        return companyMapper.toResponse(company);
    }
}
