package com.bookflow.company.controller;

import com.bookflow.company.dto.request.CreateCompanyRequest;
import com.bookflow.company.dto.request.UpdateCompanyRequest;
import com.bookflow.company.dto.response.CompanyResponse;
import com.bookflow.company.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyResponse create(
        @Valid @RequestBody CreateCompanyRequest request) {

        return companyService.create(request);
    }

    @GetMapping("/all")
    public List<CompanyResponse> findAllCompanies() {
        return companyService.findAllCompanies();
    }

    @GetMapping("/{id}")
    public CompanyResponse findById(@PathVariable Long id) {

        return companyService.findById(id);
    }

    @GetMapping
    public List<CompanyResponse> findAll() {

        return companyService.findAll();
    }

    @PutMapping("/{id}")
    public CompanyResponse update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateCompanyRequest request) {

        return companyService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {

        companyService.delete(id);
    }

    @PatchMapping("/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@PathVariable Long id) {
        companyService.activate(id);
    }
}
