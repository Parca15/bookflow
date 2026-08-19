package com.bookflow.catalog.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CatalogResponse {

    private Long id;

    private Long companyId;

    private String name;

    private BigDecimal price;

    private Integer durationMinutes;

    private String status;
}
