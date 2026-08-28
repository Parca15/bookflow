package com.bookflow.promotion.dto.response;

import com.bookflow.promotion.entity.DiscountType;
import com.bookflow.promotion.entity.PromotionStatus;
import com.bookflow.promotion.entity.PromotionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PromotionResponse {

    private Long id;

    private Long companyId;

    private String name;

    private String description;

    private PromotionType type;

    private DiscountType discountType;

    private BigDecimal discountValue;

    private String code;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private BigDecimal minPurchase;

    private Integer maxUses;

    private Integer usedCount;

    private PromotionStatus status;

    private List<ServiceSummary> services;

    @Data
    public static class ServiceSummary {

        private Long serviceId;

        private String serviceName;

        private BigDecimal price;
    }
}
