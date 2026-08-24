package com.bookflow.client.history.controller;

import com.bookflow.client.history.dto.ClientHistoryResponse;
import com.bookflow.client.history.service.ClientHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientHistoryController {

    private final ClientHistoryService clientHistoryService;

    @GetMapping("/{clientId}/history")
    public ResponseEntity<ClientHistoryResponse> findHistory(
        @PathVariable Long clientId
    ) {

        return ResponseEntity.ok(
            clientHistoryService.findByClientId(
                clientId
            )
        );
    }
}