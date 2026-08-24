package com.bookflow.client.controller;

import com.bookflow.client.dto.request.CreateClientRequest;
import com.bookflow.client.dto.request.UpdateClientRequest;
import com.bookflow.client.dto.response.ClientResponse;
import com.bookflow.client.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @PostMapping("/companies/{companyId}/clients")
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponse create(
        @PathVariable Long companyId,
        @Valid @RequestBody CreateClientRequest request
    ) {

        return clientService.create(
            companyId,
            request
        );
    }

    @GetMapping("/clients/{id}")
    public ClientResponse findById(
        @PathVariable Long id
    ) {

        return clientService.findById(id);
    }

    @GetMapping(
        "/companies/{companyId}/clients/document/{documentNumber}"
    )
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
    public List<ClientResponse> findAllByCompany(
        @PathVariable Long companyId
    ) {

        return clientService.findAllByCompany(
            companyId
        );
    }

    @GetMapping("/clients")
    public List<ClientResponse> findAll() {

        return clientService.findAll();
    }

    @GetMapping("/clients/all")
    public List<ClientResponse> findAllCompanies() {

        return clientService.findAllCompanies();
    }

    @PutMapping("/clients/{id}")
    public ClientResponse update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateClientRequest request
    ) {

        return clientService.update(
            id,
            request
        );
    }

    @DeleteMapping("/clients/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        @PathVariable Long id
    ) {

        clientService.delete(id);
    }

    @PatchMapping("/clients/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(
        @PathVariable Long id
    ) {

        clientService.activate(id);
    }
}