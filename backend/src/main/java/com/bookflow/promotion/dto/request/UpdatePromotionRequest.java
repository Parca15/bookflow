package com.bookflow.promotion.dto.request;

import com.bookflow.promotion.entity.DiscountType;
import com.bookflow.promotion.entity.PromotionStatus;
import com.bookflow.promotion.entity.PromotionType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UpdatePromotionRequest {

    @Size(max = 150)
    private String name;

    private String description;

    private PromotionType type;

    private DiscountType discountType;

    @DecimalMin(value = "0.01")
    private BigDecimal discountValue;

    private String code;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @DecimalMin(value = "0.00")
    private BigDecimal minPurchase;

    @PositiveOrZero
    private Integer maxUses;

    private PromotionStatus status;

    private List<Long> serviceIds;
}
