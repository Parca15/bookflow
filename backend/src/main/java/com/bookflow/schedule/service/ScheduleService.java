package com.bookflow.schedule.service;

import com.bookflow.schedule.dto.request.CreateScheduleRequest;
import com.bookflow.schedule.dto.request.UpdateScheduleRequest;
import com.bookflow.schedule.dto.response.ScheduleResponse;

import java.util.List;

public interface ScheduleService {

    ScheduleResponse create(
        Long employeeId,
        CreateScheduleRequest request
    );

    ScheduleResponse findById(
        Long companyId,
        Long id
    );

    List<ScheduleResponse> findAllByEmployee(Long employeeId);

    ScheduleResponse update(
        Long companyId,
        Long id,
        UpdateScheduleRequest request
    );

    void delete(
        Long companyId,
        Long id
    );

    void activate(
        Long companyId,
        Long id
    );
}
