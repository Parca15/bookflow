package com.bookflow.client.service;

import com.bookflow.client.dto.request.CreateClientRequest;
import com.bookflow.client.dto.request.UpdateClientRequest;
import com.bookflow.client.dto.response.ClientResponse;

import java.util.List;

public interface ClientService {

    ClientResponse create(
        Long companyId,
        CreateClientRequest request
    );

    ClientResponse findById(
        Long companyId,
        Long id
    );

    ClientResponse findByDocument(
        Long companyId,
        String documentNumber
    );

    List<ClientResponse> findAll();

    List<ClientResponse> findAllByCompany(
        Long companyId
    );

    List<ClientResponse> findAllCompanies();

    ClientResponse update(
        Long companyId,
        Long id,
        UpdateClientRequest request
    );

    void delete(
        Long companyId,
        Long id
    );

    void activate(
        Long companyId,
        Long id
    );

    void deletePermanently(
        Long companyId,
        Long id
    );
}
