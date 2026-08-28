package com.bookflow.promotion.dto.request;

import com.bookflow.promotion.entity.DiscountType;
import com.bookflow.promotion.entity.PromotionType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreatePromotionRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    private String description;

    @NotNull
    private PromotionType type;

    @NotNull
    private DiscountType discountType;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal discountValue;

    private String code;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

    @DecimalMin(value = "0.00")
    private BigDecimal minPurchase;

    @PositiveOrZero
    private Integer maxUses;

    private List<Long> serviceIds;
}
