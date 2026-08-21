package com.bookflow.appointment.service;

import com.bookflow.appointment.dto.request.CreateAppointmentRequest;
import com.bookflow.appointment.dto.response.AppointmentResponse;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {

    AppointmentResponse create(
        Long companyId,
        CreateAppointmentRequest request
    );

    AppointmentResponse findById(Long id);

    List<AppointmentResponse> findAllByEmployeeAndDate(
        Long employeeId,
        LocalDate appointmentDate
    );

    List<AppointmentResponse> findAllByClient(
        Long clientId
    );

    List<AppointmentResponse> findAllByCompanyAndDate(
        Long companyId,
        LocalDate appointmentDate
    );

    void cancel(Long id);
}
