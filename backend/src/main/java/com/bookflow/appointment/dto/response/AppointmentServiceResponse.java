package com.bookflow.appointment.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AppointmentServiceResponse {

    private Long id;

    private Long catalogId;

    private String serviceName;

    private BigDecimal price;

    private Integer durationMinutes;
}
