package com.bookflow.schedule.controller;

import com.bookflow.schedule.dto.request.CreateScheduleRequest;
import com.bookflow.schedule.dto.request.UpdateScheduleRequest;
import com.bookflow.schedule.dto.response.ScheduleResponse;
import com.bookflow.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping("/employees/{employeeId}/schedules")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ScheduleResponse create(
        @PathVariable Long employeeId,
        @Valid @RequestBody CreateScheduleRequest request
    ) {
        return scheduleService.create(employeeId, request);
    }

    @GetMapping("/companies/{companyId}/schedules/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ScheduleResponse findById(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {
        return scheduleService.findById(companyId, id);
    }

    @GetMapping("/employees/{employeeId}/schedules")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('EMPLOYEE')")
    public List<ScheduleResponse> findAllByEmployee(
        @PathVariable Long employeeId
    ) {
        return scheduleService.findAllByEmployee(employeeId);
    }

    @PutMapping("/companies/{companyId}/schedules/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ScheduleResponse update(
        @PathVariable Long companyId,
        @PathVariable Long id,
        @Valid @RequestBody UpdateScheduleRequest request
    ) {
        return scheduleService.update(companyId, id, request);
    }

    @DeleteMapping("/companies/{companyId}/schedules/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public void delete(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {
        scheduleService.delete(companyId, id);
    }

    @PatchMapping("/companies/{companyId}/schedules/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public void activate(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {
        scheduleService.activate(companyId, id);
    }
}
