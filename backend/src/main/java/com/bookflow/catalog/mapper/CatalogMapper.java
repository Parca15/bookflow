package com.bookflow.catalog.mapper;

import com.bookflow.catalog.dto.request.CreateCatalogRequest;
import com.bookflow.catalog.dto.request.UpdateCatalogRequest;
import com.bookflow.catalog.dto.response.CatalogResponse;
import com.bookflow.catalog.entity.Catalog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CatalogMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "status", constant = "ACTIVE")
    Catalog toEntity(CreateCatalogRequest request);

    @Mapping(target = "companyId", source = "company.id")
    CatalogResponse toResponse(Catalog catalog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateEntity(
        UpdateCatalogRequest request,
        @MappingTarget Catalog catalog
    );
}
