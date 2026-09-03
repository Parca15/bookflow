package com.bookflow.promotion.controller;

import com.bookflow.promotion.dto.request.CreatePromotionRequest;
import com.bookflow.promotion.dto.request.UpdatePromotionRequest;
import com.bookflow.promotion.dto.response.PromotionResponse;
import com.bookflow.promotion.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public PromotionResponse create(
        @PathVariable Long companyId,
        @Valid @RequestBody CreatePromotionRequest request
    ) {
        return promotionService.create(companyId, request);
    }

    @PutMapping("/{promotionId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public PromotionResponse update(
        @PathVariable Long companyId,
        @PathVariable Long promotionId,
        @Valid @RequestBody UpdatePromotionRequest request
    ) {
        return promotionService.update(
            companyId,
            promotionId,
            request
        );
    }

    @GetMapping("/{promotionId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public PromotionResponse findById(
        @PathVariable Long companyId,
        @PathVariable Long promotionId
    ) {
        return promotionService.findById(
            companyId,
            promotionId
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public List<PromotionResponse> findAllByCompany(
        @PathVariable Long companyId
    ) {
        return promotionService.findAllByCompany(companyId);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public List<PromotionResponse> findActiveByCompany(
        @PathVariable Long companyId
    ) {
        return promotionService.findActiveByCompany(
            companyId
        );
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')")
    public PromotionResponse findByCode(
        @PathVariable Long companyId,
        @PathVariable String code
    ) {
        return promotionService.findByCode(companyId, code);
    }

    @PatchMapping("/{promotionId}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public void deactivate(
        @PathVariable Long companyId,
        @PathVariable Long promotionId
    ) {
        promotionService.deactivate(
            companyId,
            promotionId
        );
    }
}
