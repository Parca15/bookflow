package com.bookflow.appointment.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class CreateAppointmentRequest {

    @NotNull
    private Long clientId;

    @NotNull
    private Long employeeId;

    @NotNull
    private LocalDate appointmentDate;

    @NotNull
    private LocalTime startTime;

    private String notes;

    @Valid
    @NotEmpty
    private List<AppointmentServiceRequest> services;
}
