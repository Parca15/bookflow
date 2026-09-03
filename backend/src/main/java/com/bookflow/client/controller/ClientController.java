package com.bookflow.client.controller;

import com.bookflow.client.dto.request.CreateClientRequest;
import com.bookflow.client.dto.request.UpdateClientRequest;
import com.bookflow.client.dto.response.ClientResponse;
import com.bookflow.client.service.ClientService;
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
public class ClientController {

    private final ClientService clientService;

    @PostMapping("/companies/{companyId}/clients")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public ClientResponse create(
        @PathVariable Long companyId,
        @Valid @RequestBody CreateClientRequest request
    ) {

        return clientService.create(
            companyId,
            request
        );
    }

    @GetMapping("/companies/{companyId}/clients/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST') or hasRole('EMPLOYEE')")
    public ClientResponse findById(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        return clientService.findById(companyId, id);
    }

    @GetMapping(
        "/companies/{companyId}/clients/document/{documentNumber}"
    )
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public ClientResponse findByDocument(
        @PathVariable Long companyId,
        @PathVariable String documentNumber
    ) {

        return clientService.findByDocument(
            companyId,
            documentNumber
        );
    }

    @GetMapping("/companies/{companyId}/clients")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST') or hasRole('EMPLOYEE')")
    public List<ClientResponse> findAllByCompany(
        @PathVariable Long companyId
    ) {
        return clientService.findAllByCompany(companyId);
    }

    @GetMapping("/companies/{companyId}/clients/paged")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST') or hasRole('EMPLOYEE')")
    public Page<ClientResponse> findAllByCompanyPaged(
        @PathVariable Long companyId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return clientService.findAllByCompanyPaged(companyId, pageable);
    }

    @GetMapping("/clients")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<ClientResponse> findAll() {

        return clientService.findAll();
    }

    @GetMapping("/clients/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<ClientResponse> findAllCompanies() {

        return clientService.findAllCompanies();
    }

    @PutMapping("/companies/{companyId}/clients/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public ClientResponse update(
        @PathVariable Long companyId,
        @PathVariable Long id,
        @Valid @RequestBody UpdateClientRequest request
    ) {

        return clientService.update(
            companyId,
            id,
            request
        );
    }

    @DeleteMapping("/companies/{companyId}/clients/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public void delete(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        clientService.delete(companyId, id);
    }

    @DeleteMapping("/companies/{companyId}/clients/{id}/permanent")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public void deletePermanently(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        clientService.deletePermanently(companyId, id);
    }

    @PatchMapping("/companies/{companyId}/clients/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public void activate(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        clientService.activate(companyId, id);
    }
}
