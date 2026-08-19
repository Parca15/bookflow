package com.bookflow.appointment.dto.response;

import com.bookflow.appointment.entity.AppointmentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class AppointmentResponse {

    private Long id;

    private Long companyId;

    private Long clientId;

    private Long employeeId;

    private LocalDate appointmentDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private AppointmentStatus status;

    private String notes;

    private List<AppointmentServiceResponse> services;

    private BigDecimal totalPrice;

    private Integer totalDurationMinutes;
}
