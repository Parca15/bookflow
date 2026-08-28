package com.bookflow.client.history.controller;

import com.bookflow.client.history.dto.ClientHistoryResponse;
import com.bookflow.client.history.service.ClientHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ClientHistoryController {

    private final ClientHistoryService clientHistoryService;

    @GetMapping("/companies/{companyId}/clients/{clientId}/history")
    public ResponseEntity<ClientHistoryResponse> findHistory(
        @PathVariable Long companyId,
        @PathVariable Long clientId
    ) {

        return ResponseEntity.ok(
            clientHistoryService.findByClientId(
                companyId,
                clientId
            )
        );
    }
}
