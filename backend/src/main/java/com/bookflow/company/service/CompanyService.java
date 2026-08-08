package com.bookflow.company.service;

import com.bookflow.company.dto.request.CreateCompanyRequest;
import com.bookflow.company.dto.request.UpdateCompanyRequest;
import com.bookflow.company.dto.response.CompanyResponse;

import java.util.List;

public interface CompanyService {

    CompanyResponse create(CreateCompanyRequest request);

    CompanyResponse findById(Long id);

    List<CompanyResponse> findAll();

    List<CompanyResponse> findAllCompanies();

    CompanyResponse update(Long id, UpdateCompanyRequest request);

    void delete(Long id);

    void activate(Long id);
}
