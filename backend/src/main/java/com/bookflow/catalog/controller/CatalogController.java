package com.bookflow.catalog.controller;

import com.bookflow.catalog.dto.request.CreateCatalogRequest;
import com.bookflow.catalog.dto.request.UpdateCatalogRequest;
import com.bookflow.catalog.dto.response.CatalogResponse;
import com.bookflow.catalog.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @PostMapping("/companies/{companyId}/catalog")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public CatalogResponse create(
        @PathVariable Long companyId,
        @Valid @RequestBody CreateCatalogRequest request
    ) {
        return catalogService.create(companyId, request);
    }

    @GetMapping("/companies/{companyId}/catalog/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST') or hasRole('EMPLOYEE')")
    public CatalogResponse findById(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {
        return catalogService.findById(companyId, id);
    }

    @GetMapping("/companies/{companyId}/catalog")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST') or hasRole('EMPLOYEE')")
    public List<CatalogResponse> findAllByCompany(
        @PathVariable Long companyId
    ) {
        return catalogService.findAllByCompany(companyId);
    }

    @GetMapping("/companies/{companyId}/catalog/paged")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST') or hasRole('EMPLOYEE')")
    public Page<CatalogResponse> findAllByCompanyPaged(
        @PathVariable Long companyId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return catalogService.findAllByCompanyPaged(companyId, pageable);
    }

    @GetMapping("/catalog")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<CatalogResponse> findAll() {
        return catalogService.findAll();
    }

    @GetMapping("/catalog/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<CatalogResponse> findAllIncludingInactive() {
        return catalogService.findAllIncludingInactive();
    }

    @PutMapping("/companies/{companyId}/catalog/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public CatalogResponse update(
        @PathVariable Long companyId,
        @PathVariable Long id,
        @Valid @RequestBody UpdateCatalogRequest request
    ) {
        return catalogService.update(companyId, id, request);
    }

    @DeleteMapping("/companies/{companyId}/catalog/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public void delete(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {
        catalogService.delete(companyId, id);
    }

    @PatchMapping("/companies/{companyId}/catalog/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public void activate(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {
        catalogService.activate(companyId, id);
    }
}
