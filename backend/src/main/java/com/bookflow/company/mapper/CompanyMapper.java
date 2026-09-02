package com.bookflow.company.mapper;

import com.bookflow.company.dto.request.CreateCompanyRequest;
import com.bookflow.company.dto.request.UpdateCompanyRequest;
import com.bookflow.company.dto.response.CompanyResponse;
import com.bookflow.company.entity.Company;
import com.bookflow.company.entity.DocumentType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "documentType", expression = "java(com.bookflow.company.entity.DocumentType.valueOf(request.getDocumentType()))")
    Company toEntity(CreateCompanyRequest request);

    CompanyResponse toResponse(Company company);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateEntity(UpdateCompanyRequest request, @MappingTarget Company company);
}
