package com.bookflow.schedule.controller;

import com.bookflow.schedule.dto.request.CreateScheduleRequest;
import com.bookflow.schedule.dto.request.UpdateScheduleRequest;
import com.bookflow.schedule.dto.response.ScheduleResponse;
import com.bookflow.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping("/employees/{employeeId}/schedules")
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleResponse create(
        @PathVariable Long employeeId,
        @Valid @RequestBody CreateScheduleRequest request
    ) {
        return scheduleService.create(employeeId, request);
    }

    @GetMapping("/schedules/{id}")
    public ScheduleResponse findById(
        @PathVariable Long id
    ) {
        return scheduleService.findById(id);
    }

    @GetMapping("/employees/{employeeId}/schedules")
    public List<ScheduleResponse> findAllByEmployee(
        @PathVariable Long employeeId
    ) {
        return scheduleService.findAllByEmployee(employeeId);
    }

    @PutMapping("/schedules/{id}")
    public ScheduleResponse update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateScheduleRequest request
    ) {
        return scheduleService.update(id, request);
    }

    @DeleteMapping("/schedules/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        @PathVariable Long id
    ) {
        scheduleService.delete(id);
    }

    @PatchMapping("/schedules/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(
        @PathVariable Long id
    ) {
        scheduleService.activate(id);
    }
}
