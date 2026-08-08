package com.bookflow.client.service;

import com.bookflow.client.dto.request.CreateClientRequest;
import com.bookflow.client.dto.request.UpdateClientRequest;
import com.bookflow.client.dto.response.ClientResponse;

import java.util.List;

public interface ClientService {

    ClientResponse create(Long companyId, CreateClientRequest request);

    ClientResponse findById(Long id);

    List<ClientResponse> findAll();

    List<ClientResponse> findAllByCompany(Long companyId);

    List<ClientResponse> findAllCompanies();

    ClientResponse update(Long id, UpdateClientRequest request);

    void delete(Long id);

    void activate(Long id);
}
