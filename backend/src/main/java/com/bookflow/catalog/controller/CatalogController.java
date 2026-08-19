package com.bookflow.catalog.controller;

import com.bookflow.catalog.dto.request.CreateCatalogRequest;
import com.bookflow.catalog.dto.request.UpdateCatalogRequest;
import com.bookflow.catalog.dto.response.CatalogResponse;
import com.bookflow.catalog.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @PostMapping("/companies/{companyId}/catalog")
    @ResponseStatus(HttpStatus.CREATED)
    public CatalogResponse create(
        @PathVariable Long companyId,
        @Valid @RequestBody CreateCatalogRequest request
    ) {
        return catalogService.create(companyId, request);
    }

    @GetMapping("/catalog/{id}")
    public CatalogResponse findById(
        @PathVariable Long id
    ) {
        return catalogService.findById(id);
    }

    @GetMapping("/companies/{companyId}/catalog")
    public List<CatalogResponse> findAllByCompany(
        @PathVariable Long companyId
    ) {
        return catalogService.findAllByCompany(companyId);
    }

    @GetMapping("/catalog")
    public List<CatalogResponse> findAll() {
        return catalogService.findAll();
    }

    @GetMapping("/catalog/all")
    public List<CatalogResponse> findAllIncludingInactive() {
        return catalogService.findAllIncludingInactive();
    }

    @PutMapping("/catalog/{id}")
    public CatalogResponse update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateCatalogRequest request
    ) {
        return catalogService.update(id, request);
    }

    @DeleteMapping("/catalog/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        @PathVariable Long id
    ) {
        catalogService.delete(id);
    }

    @PatchMapping("/catalog/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(
        @PathVariable Long id
    ) {
        catalogService.activate(id);
    }
}
