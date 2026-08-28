package com.bookflow.appointment.service;

import com.bookflow.appointment.dto.request.CreateAppointmentRequest;
import com.bookflow.appointment.dto.request.UpdateAppointmentRequest;
import com.bookflow.appointment.dto.response.AppointmentResponse;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {

    AppointmentResponse create(
        Long companyId,
        CreateAppointmentRequest request
    );

    AppointmentResponse findById(
        Long companyId,
        Long id
    );

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

    AppointmentResponse update(
        Long companyId,
        Long id,
        UpdateAppointmentRequest request
    );

    void confirm(
        Long companyId,
        Long id
    );

    void start(
        Long companyId,
        Long id
    );

    void complete(
        Long companyId,
        Long id
    );

    void noShow(
        Long companyId,
        Long id
    );

    void cancel(
        Long companyId,
        Long id
    );
}
