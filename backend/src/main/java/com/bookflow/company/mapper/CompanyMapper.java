package com.bookflow.company.mapper;

import com.bookflow.company.dto.request.CreateCompanyRequest;
import com.bookflow.company.dto.response.CompanyResponse;
import com.bookflow.company.entity.Company;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "ACTIVE")
    Company toEntity(CreateCompanyRequest request);

    CompanyResponse toResponse(Company company);

}
