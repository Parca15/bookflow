package com.bookflow.company.service;

import com.bookflow.company.dto.request.CreateCompanyRequest;
import com.bookflow.company.dto.response.CompanyResponse;

public interface CompanyService {

    CompanyResponse create(CreateCompanyRequest request);

}
