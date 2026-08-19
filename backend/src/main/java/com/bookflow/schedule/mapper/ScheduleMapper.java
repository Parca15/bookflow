package com.bookflow.schedule.mapper;

import com.bookflow.schedule.dto.request.CreateScheduleRequest;
import com.bookflow.schedule.dto.request.UpdateScheduleRequest;
import com.bookflow.schedule.dto.response.ScheduleResponse;
import com.bookflow.schedule.entity.Schedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "employee", ignore = true)
    @Mapping(target = "status", constant = "ACTIVE")
    Schedule toEntity(CreateScheduleRequest request);

    @Mapping(target = "employeeId", source = "employee.id")
    ScheduleResponse toResponse(Schedule schedule);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "employee", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateEntity(
        UpdateScheduleRequest request,
        @MappingTarget Schedule schedule
    );
}
