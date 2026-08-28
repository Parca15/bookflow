package com.bookflow.promotion.service;

import com.bookflow.promotion.dto.request.CreatePromotionRequest;
import com.bookflow.promotion.dto.request.UpdatePromotionRequest;
import com.bookflow.promotion.dto.response.PromotionResponse;

import java.util.List;

public interface PromotionService {

    PromotionResponse create(
        Long companyId,
        CreatePromotionRequest request
    );

    PromotionResponse update(
        Long companyId,
        Long promotionId,
        UpdatePromotionRequest request
    );

    PromotionResponse findById(
        Long companyId,
        Long promotionId
    );

    List<PromotionResponse> findAllByCompany(Long companyId);

    List<PromotionResponse> findActiveByCompany(
        Long companyId
    );

    PromotionResponse findByCode(
        Long companyId,
        String code
    );

    void deactivate(
        Long companyId,
        Long promotionId
    );
}
