package com.bookflow.client.service;

import com.bookflow.client.dto.request.CreateClientRequest;
import com.bookflow.client.dto.request.UpdateClientRequest;
import com.bookflow.client.dto.response.ClientResponse;
import com.bookflow.client.entity.Client;
import com.bookflow.client.entity.ClientStatus;
import com.bookflow.client.mapper.ClientMapper;
import com.bookflow.client.repository.ClientRepository;
import com.bookflow.client.service.impl.ClientServiceImpl;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceImplTest {

    @Mock private ClientRepository clientRepository;
    @Mock private ClientMapper clientMapper;
    @Mock private CompanyRepository companyRepository;
    @InjectMocks private ClientServiceImpl clientService;

    private Company company;
    private Client client;
    private ClientResponse clientResponse;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);

        client = new Client();
        client.setId(10L);
        client.setCompany(company);
        client.setFirstName("Juan");
        client.setLastName("Pérez");
        client.setStatus(ClientStatus.ACTIVE);

        clientResponse = new ClientResponse();
        clientResponse.setId(10L);
        clientResponse.setFirstName("Juan");
        clientResponse.setLastName("Pérez");
    }

    @Test
    void create_success() {
        CreateClientRequest req = new CreateClientRequest();
        req.setFirstName("Juan");
        req.setLastName("Pérez");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(clientMapper.toEntity(any())).thenReturn(client);
        when(clientRepository.save(any())).thenReturn(client);
        when(clientMapper.toResponse(any())).thenReturn(clientResponse);

        ClientResponse result = clientService.create(1L, req);

        assertNotNull(result);
        assertEquals("Juan", result.getFirstName());
        verify(clientRepository).save(any());
    }

    @Test
    void create_duplicateDocument_throws() {
        CreateClientRequest req = new CreateClientRequest();
        req.setDocumentNumber("12345");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(clientRepository.existsByCompanyIdAndDocumentNumber(1L, "12345")).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> clientService.create(1L, req));
    }

    @Test
    void findById_found() {
        when(clientRepository.findByIdAndCompanyId(10L, 1L)).thenReturn(Optional.of(client));
        when(clientMapper.toResponse(client)).thenReturn(clientResponse);

        ClientResponse result = clientService.findById(1L, 10L);

        assertNotNull(result);
        assertEquals(10L, result.getId());
    }

    @Test
    void findById_notFound_throws() {
        when(clientRepository.findByIdAndCompanyId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> clientService.findById(1L, 99L));
    }

    @Test
    void findAllByCompany_returnsActive() {
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(clientRepository.findAllByCompanyIdAndStatus(1L, ClientStatus.ACTIVE))
            .thenReturn(List.of(client));
        when(clientMapper.toResponse(client)).thenReturn(clientResponse);

        List<ClientResponse> result = clientService.findAllByCompany(1L);

        assertEquals(1, result.size());
    }

    @Test
    void delete_setsInactive() {
        when(clientRepository.findByIdAndCompanyId(10L, 1L)).thenReturn(Optional.of(client));
        when(clientRepository.save(any())).thenReturn(client);

        clientService.delete(1L, 10L);

        assertEquals(ClientStatus.INACTIVE, client.getStatus());
        verify(clientRepository).save(client);
    }
}
