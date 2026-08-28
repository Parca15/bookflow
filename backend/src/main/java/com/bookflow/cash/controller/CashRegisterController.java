package com.bookflow.cash.controller;

import com.bookflow.cash.dto.request.CloseCashRegisterRequest;
import com.bookflow.cash.dto.request.OpenCashRegisterRequest;
import com.bookflow.cash.dto.response.CashRegisterResponse;
import com.bookflow.cash.service.CashRegisterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(
    "/api/v1/companies/{companyId}/cash-registers"
)
@RequiredArgsConstructor
public class CashRegisterController {

    private final CashRegisterService cashRegisterService;

    @PostMapping
    public ResponseEntity<CashRegisterResponse> open(
        @PathVariable Long companyId,
        @Valid @RequestBody OpenCashRegisterRequest request
    ) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                cashRegisterService.open(
                    companyId,
                    request
                )
            );
    }

    @GetMapping("/open")
    public ResponseEntity<CashRegisterResponse> findOpen(
        @PathVariable Long companyId
    ) {

        return ResponseEntity.ok(
            cashRegisterService.findOpen(companyId)
        );
    }

    @GetMapping
    public ResponseEntity<List<CashRegisterResponse>>
    findAll(
        @PathVariable Long companyId
    ) {

        return ResponseEntity.ok(
            cashRegisterService.findAllByCompany(companyId)
        );
    }

    @GetMapping("/{cashRegisterId}")
    public ResponseEntity<CashRegisterResponse> findById(
        @PathVariable Long companyId,
        @PathVariable Long cashRegisterId
    ) {

        return ResponseEntity.ok(
            cashRegisterService.findById(
                companyId,
                cashRegisterId
            )
        );
    }

    @PutMapping("/{cashRegisterId}/close")
    public ResponseEntity<CashRegisterResponse> close(
        @PathVariable Long companyId,
        @PathVariable Long cashRegisterId,
        @Valid @RequestBody CloseCashRegisterRequest request
    ) {

        return ResponseEntity.ok(
            cashRegisterService.close(
                companyId,
                cashRegisterId,
                request
            )
        );
    }
}
