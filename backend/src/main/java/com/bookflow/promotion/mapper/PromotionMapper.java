package com.bookflow.promotion.mapper;

import com.bookflow.promotion.dto.response.PromotionResponse;
import com.bookflow.promotion.entity.Promotion;
import org.springframework.stereotype.Component;

@Component
public class PromotionMapper {

    public PromotionResponse toResponse(Promotion p) {
        PromotionResponse r = new PromotionResponse();
        r.setId(p.getId());
        r.setCompanyId(p.getCompany().getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setType(p.getType());
        r.setDiscountType(p.getDiscountType());
        r.setDiscountValue(p.getDiscountValue());
        r.setCode(p.getCode());
        r.setStartDate(p.getStartDate());
        r.setEndDate(p.getEndDate());
        r.setMinPurchase(p.getMinPurchase());
        r.setMaxUses(p.getMaxUses());
        r.setUsedCount(p.getUsedCount());
        r.setStatus(p.getStatus());

        if (p.getServices() != null) {
            r.setServices(p.getServices().stream().map(service -> {
                PromotionResponse.ServiceSummary s = new PromotionResponse.ServiceSummary();
                s.setServiceId(service.getId());
                s.setServiceName(service.getName());
                s.setPrice(service.getPrice());
                return s;
            }).toList());
        }

        return r;
    }
}
