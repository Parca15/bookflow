package com.bookflow.appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplyCouponRequest {

    @NotBlank
    private String code;
}