package com.bookflow.cash.controller;

import com.bookflow.cash.dto.request.CloseCashRegisterRequest;
import com.bookflow.cash.dto.request.OpenCashRegisterRequest;
import com.bookflow.cash.dto.response.CashRegisterResponse;
import com.bookflow.cash.service.CashRegisterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
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
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public ResponseEntity<CashRegisterResponse> findOpen(
        @PathVariable Long companyId
    ) {

        return ResponseEntity.ok(
            cashRegisterService.findOpen(companyId)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public ResponseEntity<List<CashRegisterResponse>>
    findAll(
        @PathVariable Long companyId
    ) {

        return ResponseEntity.ok(
            cashRegisterService.findAllByCompany(companyId)
        );
    }

    @GetMapping("/{cashRegisterId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
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
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
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
