package com.bookflow.appointment.repository;

import com.bookflow.appointment.entity.AppointmentItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentItemRepository
    extends JpaRepository<AppointmentItem, Long> {

    List<AppointmentItem> findAllByAppointmentId(
        Long appointmentId
    );
}
