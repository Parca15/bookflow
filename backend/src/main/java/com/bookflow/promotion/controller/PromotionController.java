package com.bookflow.promotion.controller;

import com.bookflow.promotion.dto.request.CreatePromotionRequest;
import com.bookflow.promotion.dto.request.UpdatePromotionRequest;
import com.bookflow.promotion.dto.response.PromotionResponse;
import com.bookflow.promotion.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies/{companyId}/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PromotionResponse create(
        @PathVariable Long companyId,
        @Valid @RequestBody CreatePromotionRequest request
    ) {
        return promotionService.create(companyId, request);
    }

    @PutMapping("/{promotionId}")
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
    public List<PromotionResponse> findAllByCompany(
        @PathVariable Long companyId
    ) {
        return promotionService.findAllByCompany(companyId);
    }

    @GetMapping("/active")
    public List<PromotionResponse> findActiveByCompany(
        @PathVariable Long companyId
    ) {
        return promotionService.findActiveByCompany(
            companyId
        );
    }

    @GetMapping("/code/{code}")
    public PromotionResponse findByCode(
        @PathVariable Long companyId,
        @PathVariable String code
    ) {
        return promotionService.findByCode(companyId, code);
    }

    @PatchMapping("/{promotionId}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
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
