package com.bookflow.catalog.service;

import com.bookflow.catalog.dto.request.CreateCatalogRequest;
import com.bookflow.catalog.dto.response.CatalogResponse;
import com.bookflow.catalog.entity.Catalog;
import com.bookflow.catalog.entity.CatalogStatus;
import com.bookflow.catalog.mapper.CatalogMapper;
import com.bookflow.catalog.repository.CatalogRepository;
import com.bookflow.catalog.service.impl.CatalogServiceImpl;
import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.repository.CompanyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogServiceImplTest {

    @Mock private CatalogRepository catalogRepository;
    @Mock private CatalogMapper catalogMapper;
    @Mock private CompanyRepository companyRepository;
    @InjectMocks private CatalogServiceImpl catalogService;

    private Company company;
    private Catalog catalog;
    private CatalogResponse catalogResponse;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);

        catalog = new Catalog();
        catalog.setId(30L);
        catalog.setCompany(company);
        catalog.setName("Corte de cabello");
        catalog.setPrice(new BigDecimal("25000"));
        catalog.setDurationMinutes(30);
        catalog.setStatus(CatalogStatus.ACTIVE);

        catalogResponse = new CatalogResponse();
        catalogResponse.setId(30L);
        catalogResponse.setName("Corte de cabello");
        catalogResponse.setPrice(new BigDecimal("25000"));
    }

    @Test
    void create_success() {
        CreateCatalogRequest req = new CreateCatalogRequest();
        req.setName("Corte de cabello");
        req.setPrice(new BigDecimal("25000"));
        req.setDurationMinutes(30);

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(catalogRepository.existsByCompanyIdAndName(1L, "Corte de cabello")).thenReturn(false);
        when(catalogMapper.toEntity(any())).thenReturn(catalog);
        when(catalogRepository.save(any())).thenReturn(catalog);
        when(catalogMapper.toResponse(any())).thenReturn(catalogResponse);

        CatalogResponse result = catalogService.create(1L, req);

        assertNotNull(result);
        assertEquals("Corte de cabello", result.getName());
    }

    @Test
    void create_duplicateName_throws() {
        CreateCatalogRequest req = new CreateCatalogRequest();
        req.setName("Corte de cabello");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(catalogRepository.existsByCompanyIdAndName(1L, "Corte de cabello")).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> catalogService.create(1L, req));
    }

    @Test
    void findById_found() {
        when(catalogRepository.findByIdAndCompanyId(30L, 1L)).thenReturn(Optional.of(catalog));
        when(catalogMapper.toResponse(catalog)).thenReturn(catalogResponse);

        CatalogResponse result = catalogService.findById(1L, 30L);

        assertEquals(30L, result.getId());
    }

    @Test
    void findById_notFound_throws() {
        when(catalogRepository.findByIdAndCompanyId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> catalogService.findById(1L, 99L));
    }

    @Test
    void findAllByCompany_returnsActive() {
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(catalogRepository.findAllByCompanyIdAndStatus(1L, CatalogStatus.ACTIVE))
            .thenReturn(List.of(catalog));
        when(catalogMapper.toResponse(catalog)).thenReturn(catalogResponse);

        List<CatalogResponse> result = catalogService.findAllByCompany(1L);

        assertEquals(1, result.size());
    }

    @Test
    void delete_setsInactive() {
        when(catalogRepository.findByIdAndCompanyId(30L, 1L)).thenReturn(Optional.of(catalog));
        when(catalogRepository.save(any())).thenReturn(catalog);

        catalogService.delete(1L, 30L);

        assertEquals(CatalogStatus.INACTIVE, catalog.getStatus());
    }
}
