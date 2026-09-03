package com.bookflow.expense.controller;

import com.bookflow.expense.dto.request.CreateExpenseRequest;
import com.bookflow.expense.dto.response.ExpenseResponse;
import com.bookflow.expense.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ExpenseResponse> create(
        @PathVariable Long companyId,
        @Valid @RequestBody CreateExpenseRequest request
    ) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                expenseService.create(
                    companyId,
                    request
                )
            );
    }

    @GetMapping("/{expenseId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ExpenseResponse> findById(
        @PathVariable Long companyId,
        @PathVariable Long expenseId
    ) {

        return ResponseEntity.ok(
            expenseService.findById(
                companyId,
                expenseId
            )
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<ExpenseResponse>> findAll(
        @PathVariable Long companyId
    ) {

        return ResponseEntity.ok(
            expenseService.findAllByCompany(companyId)
        );
    }

    @GetMapping(
        "/cash-register/{cashRegisterId}"
    )
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<ExpenseResponse>>
    findAllByCashRegister(
        @PathVariable Long companyId,
        @PathVariable Long cashRegisterId
    ) {

        return ResponseEntity.ok(
            expenseService.findAllByCashRegister(
                companyId,
                cashRegisterId
            )
        );
    }
}
