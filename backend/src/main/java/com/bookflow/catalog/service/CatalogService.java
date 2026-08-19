package com.bookflow.catalog.service;

import com.bookflow.catalog.dto.request.CreateCatalogRequest;
import com.bookflow.catalog.dto.request.UpdateCatalogRequest;
import com.bookflow.catalog.dto.response.CatalogResponse;

import java.util.List;

public interface CatalogService {

    CatalogResponse create(
        Long companyId,
        CreateCatalogRequest request
    );

    CatalogResponse findById(Long id);

    List<CatalogResponse> findAllByCompany(Long companyId);

    List<CatalogResponse> findAll();

    List<CatalogResponse> findAllIncludingInactive();

    CatalogResponse update(
        Long id,
        UpdateCatalogRequest request
    );

    void delete(Long id);

    void activate(Long id);
}
