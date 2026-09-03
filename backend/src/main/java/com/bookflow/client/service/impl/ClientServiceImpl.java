package com.bookflow.client.service.impl;

import com.bookflow.client.dto.request.CreateClientRequest;
import com.bookflow.client.dto.request.UpdateClientRequest;
import com.bookflow.client.dto.response.ClientResponse;
import com.bookflow.client.entity.Client;
import com.bookflow.client.entity.ClientStatus;
import com.bookflow.client.mapper.ClientMapper;
import com.bookflow.client.repository.ClientRepository;
import com.bookflow.client.service.ClientService;
import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;
    private final CompanyRepository companyRepository;

    @Override
    public ClientResponse create(
        Long companyId,
        CreateClientRequest request
    ) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + companyId
                )
            );

        if (request.getDocumentNumber() != null &&
            clientRepository.existsByCompanyIdAndDocumentNumber(
                companyId,
                request.getDocumentNumber()
            )) {

            throw new ResourceAlreadyExistsException(
                "Ya existe un cliente con ese documento en la empresa."
            );
        }

        Client client = clientMapper.toEntity(request);

        client.setCompany(company);

        client = clientRepository.save(client);

        return clientMapper.toResponse(client);
    }

    @Override
    public ClientResponse findById(
        Long companyId,
        Long id
    ) {

        Client client = clientRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el cliente con id: " + id
                )
            );

        return clientMapper.toResponse(client);
    }

    @Override
    public ClientResponse findByDocument(
        Long companyId,
        String documentNumber
    ) {

        companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + companyId
                )
            );

        Client client =
            clientRepository
                .findByCompanyIdAndDocumentNumber(
                    companyId,
                    documentNumber
                )
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "No se encontró un cliente con el documento: "
                            + documentNumber
                    )
                );

        return clientMapper.toResponse(client);
    }

    @Override
    public List<ClientResponse> findAll() {

        return clientRepository.findAll()
            .stream()
            .map(clientMapper::toResponse)
            .toList();
    }

    @Override
    public List<ClientResponse> findAllByCompany(
        Long companyId
    ) {

        companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: " + companyId
                )
            );

        return clientRepository
            .findAllByCompanyIdAndStatus(
                companyId,
                ClientStatus.ACTIVE
            )
            .stream()
            .map(clientMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClientResponse> findAllByCompanyPaged(Long companyId, Pageable pageable) {
        return clientRepository
            .findAllByCompanyIdAndStatus(companyId, ClientStatus.ACTIVE, pageable)
            .map(clientMapper::toResponse);
    }

    @Override
    public List<ClientResponse> findAllCompanies() {

        return clientRepository.findAll()
            .stream()
            .map(clientMapper::toResponse)
            .toList();
    }

    @Override
    public ClientResponse update(
        Long companyId,
        Long id,
        UpdateClientRequest request
    ) {

        Client client = clientRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el cliente con id: " + id
                )
            );

        if (request.getDocumentNumber() != null &&
            clientRepository
                .existsByCompanyIdAndDocumentNumberAndIdNot(
                    companyId,
                    request.getDocumentNumber(),
                    id
                )) {

            throw new ResourceAlreadyExistsException(
                "Ya existe otro cliente con ese documento en la empresa."
            );
        }

        clientMapper.updateEntity(
            request,
            client
        );

        client = clientRepository.save(client);

        return clientMapper.toResponse(client);
    }

    @Override
    public void delete(
        Long companyId,
        Long id
    ) {

        Client client = clientRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el cliente con id: " + id
                )
            );

        client.setStatus(
            ClientStatus.INACTIVE
        );

        clientRepository.save(client);
    }

    @Override
    public void activate(
        Long companyId,
        Long id
    ) {

        Client client = clientRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el cliente con id: " + id
                )
            );

        client.setStatus(
            ClientStatus.ACTIVE
        );

        clientRepository.save(client);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deletePermanently(
        Long companyId,
        Long id
    ) {

        Client client = clientRepository.findByIdAndCompanyId(id, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el cliente con id: " + id
                )
            );

        Long clientId = client.getId();

        clientRepository.deletePaymentsByClientId(clientId);
        clientRepository.deleteAppointmentItemsByClientId(clientId);
        clientRepository.deleteInvoicesByClientId(clientId);
        clientRepository.deleteAppointmentsByClientId(clientId);

        clientRepository.deleteById(clientId);
    }
}
