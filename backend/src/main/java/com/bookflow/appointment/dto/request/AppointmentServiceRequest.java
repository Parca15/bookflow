package com.bookflow.appointment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentServiceRequest {

    @NotNull
    private Long catalogId;
}
