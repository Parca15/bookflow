package com.bookflow.appointment.repository;

import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository
    extends JpaRepository<Appointment, Long> {

    List<Appointment> findAllByEmployeeIdAndAppointmentDate(
        Long employeeId,
        LocalDate appointmentDate
    );

    List<Appointment> findAllByClientId(
        Long clientId
    );

    List<Appointment> findAllByCompanyIdAndAppointmentDate(
        Long companyId,
        LocalDate appointmentDate
    );

    List<Appointment> findAllByCompanyIdAndStatus(
        Long companyId,
        AppointmentStatus status
    );

    boolean existsByEmployeeIdAndAppointmentDateAndStartTimeLessThanAndEndTimeGreaterThan(
        Long employeeId,
        LocalDate appointmentDate,
        LocalTime endTime,
        LocalTime startTime
    );
}
