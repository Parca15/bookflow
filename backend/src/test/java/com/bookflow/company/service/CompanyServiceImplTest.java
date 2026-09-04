package com.bookflow.company.service;

import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.dto.request.CreateCompanyRequest;
import com.bookflow.company.dto.request.UpdateCompanyRequest;
import com.bookflow.company.dto.response.CompanyResponse;
import com.bookflow.company.entity.Company;
import com.bookflow.company.entity.CompanyStatus;
import com.bookflow.company.mapper.CompanyMapper;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.company.service.impl.CompanyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceImplTest {

    @Mock private CompanyRepository companyRepository;
    @Mock private CompanyMapper companyMapper;
    @InjectMocks private CompanyServiceImpl companyService;

    private Company company;
    private CompanyResponse companyResponse;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);
        company.setBusinessName("Salón Belleza");
        company.setDocumentNumber("900123456");
        company.setStatus(CompanyStatus.ACTIVE);

        companyResponse = new CompanyResponse();
        companyResponse.setId(1L);
        companyResponse.setBusinessName("Salón Belleza");
    }

    @Test
    void create_success() {
        CreateCompanyRequest req = new CreateCompanyRequest();
        req.setBusinessName("Salón Belleza");
        req.setDocumentNumber("900123456");

        when(companyRepository.existsByDocumentNumber("900123456")).thenReturn(false);
        when(companyMapper.toEntity(any())).thenReturn(company);
        when(companyRepository.save(any())).thenReturn(company);
        when(companyMapper.toResponse(any())).thenReturn(companyResponse);

        CompanyResponse result = companyService.create(req);

        assertNotNull(result);
        assertEquals("Salón Belleza", result.getBusinessName());
        verify(companyRepository).save(any());
    }

    @Test
    void create_duplicateDocument_throws() {
        CreateCompanyRequest req = new CreateCompanyRequest();
        req.setDocumentNumber("900123456");

        when(companyRepository.existsByDocumentNumber("900123456")).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> companyService.create(req));
    }

    @Test
    void create_noDocument_success() {
        CreateCompanyRequest req = new CreateCompanyRequest();
        req.setBusinessName("Salón Sin Doc");

        when(companyMapper.toEntity(any())).thenReturn(company);
        when(companyRepository.save(any())).thenReturn(company);
        when(companyMapper.toResponse(any())).thenReturn(companyResponse);

        CompanyResponse result = companyService.create(req);

        assertNotNull(result);
        verify(companyRepository, never()).existsByDocumentNumber(any());
    }

    @Test
    void findById_found() {
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(companyMapper.toResponse(company)).thenReturn(companyResponse);

        CompanyResponse result = companyService.findById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void findById_notFound_throws() {
        when(companyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.findById(99L));
    }

    @Test
    void findAll_returnsActive() {
        when(companyRepository.findAllByStatus(CompanyStatus.ACTIVE)).thenReturn(List.of(company));
        when(companyMapper.toResponse(company)).thenReturn(companyResponse);

        List<CompanyResponse> result = companyService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void update_success() {
        UpdateCompanyRequest req = new UpdateCompanyRequest();
        req.setBusinessName("Salón Actualizado");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(companyRepository.save(any())).thenReturn(company);
        when(companyMapper.toResponse(any())).thenReturn(companyResponse);

        CompanyResponse result = companyService.update(1L, req);

        assertNotNull(result);
        verify(companyMapper).updateEntity(req, company);
    }

    @Test
    void update_duplicateDocument_throws() {
        UpdateCompanyRequest req = new UpdateCompanyRequest();
        req.setDocumentNumber("999999");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(companyRepository.existsByDocumentNumberAndIdNot("999999", 1L)).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> companyService.update(1L, req));
    }

    @Test
    void delete_setsInactive() {
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(companyRepository.save(any())).thenReturn(company);

        companyService.delete(1L);

        assertEquals(CompanyStatus.INACTIVE, company.getStatus());
        verify(companyRepository).save(company);
    }

    @Test
    void delete_notFound_throws() {
        when(companyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.delete(99L));
    }

    @Test
    void activate_success() {
        company.setStatus(CompanyStatus.INACTIVE);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(companyRepository.save(any())).thenReturn(company);

        companyService.activate(1L);

        assertEquals(CompanyStatus.ACTIVE, company.getStatus());
    }

    @Test
    void activate_notFound_throws() {
        when(companyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.activate(99L));
    }
}
