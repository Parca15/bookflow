package com.bookflow.catalog.service.impl;

import com.bookflow.catalog.dto.request.CreateCatalogRequest;
import com.bookflow.catalog.dto.request.UpdateCatalogRequest;
import com.bookflow.catalog.dto.response.CatalogResponse;
import com.bookflow.catalog.entity.Catalog;
import com.bookflow.catalog.entity.CatalogStatus;
import com.bookflow.catalog.mapper.CatalogMapper;
import com.bookflow.catalog.repository.CatalogRepository;
import com.bookflow.catalog.service.CatalogService;
import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogServiceImpl implements CatalogService {

    private final CatalogRepository catalogRepository;
    private final CatalogMapper catalogMapper;
    private final CompanyRepository companyRepository;

    @Override
    public CatalogResponse create(
        Long companyId,
        CreateCatalogRequest request
    ) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + companyId
                )
            );

        if (catalogRepository.existsByCompanyIdAndName(
            companyId,
            request.getName()
        )) {
            throw new ResourceAlreadyExistsException(
                "Ya existe un servicio con ese nombre en la empresa."
            );
        }

        Catalog catalog = catalogMapper.toEntity(request);

        catalog.setCompany(company);

        catalog = catalogRepository.save(catalog);

        return catalogMapper.toResponse(catalog);
    }

    @Override
    public CatalogResponse findById(
        Long companyId,
        Long id
    ) {

        Catalog catalog = catalogRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el servicio con id: " + id
                )
            );

        return catalogMapper.toResponse(catalog);
    }

    @Override
    public List<CatalogResponse> findAllByCompany(Long companyId) {

        companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + companyId
                )
            );

        return catalogRepository
            .findAllByCompanyIdAndStatus(
                companyId,
                CatalogStatus.ACTIVE
            )
            .stream()
            .map(catalogMapper::toResponse)
            .toList();
    }

    @Override
    public List<CatalogResponse> findAll() {

        return catalogRepository.findAll()
            .stream()
            .map(catalogMapper::toResponse)
            .toList();
    }

    @Override
    public List<CatalogResponse> findAllIncludingInactive() {

        return catalogRepository.findAll()
            .stream()
            .map(catalogMapper::toResponse)
            .toList();
    }

    @Override
    public CatalogResponse update(
        Long companyId,
        Long id,
        UpdateCatalogRequest request
    ) {

        Catalog catalog = catalogRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el servicio con id: " + id
                )
            );

        if (catalogRepository.existsByCompanyIdAndNameAndIdNot(
            companyId,
            request.getName(),
            id
        )) {
            throw new ResourceAlreadyExistsException(
                "Ya existe otro servicio con ese nombre en la empresa."
            );
        }

        catalogMapper.updateEntity(request, catalog);

        catalog = catalogRepository.save(catalog);

        return catalogMapper.toResponse(catalog);
    }

    @Override
    public void delete(
        Long companyId,
        Long id
    ) {

        Catalog catalog = catalogRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el servicio con id: " + id
                )
            );

        catalog.setStatus(CatalogStatus.INACTIVE);

        catalogRepository.save(catalog);
    }

    @Override
    public void activate(
        Long companyId,
        Long id
    ) {

        Catalog catalog = catalogRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el servicio con id: " + id
                )
            );

        catalog.setStatus(CatalogStatus.ACTIVE);

        catalogRepository.save(catalog);
    }
}
