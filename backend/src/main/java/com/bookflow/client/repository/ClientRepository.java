package com.bookflow.client.repository;

import com.bookflow.client.entity.Client;
import com.bookflow.client.entity.ClientStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Long> {

    boolean existsByCompanyIdAndDocumentNumber(
        Long companyId,
        String documentNumber
    );

    List<Client> findAllByCompanyIdAndStatus(
        Long companyId,
        ClientStatus status
    );

    boolean existsByCompanyIdAndDocumentNumberAndIdNot(
        Long companyId,
        String documentNumber,
        Long id
    );
}
