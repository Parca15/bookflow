package com.bookflow.appointment.mapper;

import com.bookflow.appointment.dto.response.AppointmentResponse;
import com.bookflow.appointment.dto.response.AppointmentServiceResponse;
import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.entity.AppointmentItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "companyId", source = "company.id")
    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "employeeId", source = "employee.id")
    @Mapping(target = "services", source = "services")
    @Mapping(target = "totalPrice", ignore = true)
    @Mapping(target = "totalDurationMinutes", ignore = true)
    AppointmentResponse toResponse(Appointment appointment);

    @Mapping(target = "catalogId", source = "catalog.id")
    @Mapping(target = "serviceName", source = "catalog.name")
    AppointmentServiceResponse toServiceResponse(
        AppointmentItem appointmentItem
    );
}
