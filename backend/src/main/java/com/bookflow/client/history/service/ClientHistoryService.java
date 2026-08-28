package com.bookflow.client.history.service;

import com.bookflow.client.history.dto.ClientHistoryResponse;

public interface ClientHistoryService {

    ClientHistoryResponse findByClientId(
        Long companyId,
        Long clientId
    );
}
