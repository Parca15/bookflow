package com.bookflow.schedule.service.impl;

import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.employee.entity.Employee;
import com.bookflow.employee.repository.EmployeeRepository;
import com.bookflow.schedule.dto.request.CreateScheduleRequest;
import com.bookflow.schedule.dto.request.UpdateScheduleRequest;
import com.bookflow.schedule.dto.response.ScheduleResponse;
import com.bookflow.schedule.entity.Schedule;
import com.bookflow.schedule.entity.ScheduleStatus;
import com.bookflow.schedule.mapper.ScheduleMapper;
import com.bookflow.schedule.repository.ScheduleRepository;
import com.bookflow.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ScheduleMapper scheduleMapper;
    private final EmployeeRepository employeeRepository;

    @Override
    public ScheduleResponse create(
        Long employeeId,
        CreateScheduleRequest request
    ) {

        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el empleado con id: " + employeeId
                )
            );

        validateTimeRange(
            request.getStartTime(),
            request.getEndTime()
        );

        Schedule schedule = scheduleMapper.toEntity(request);

        schedule.setEmployee(employee);

        schedule = scheduleRepository.save(schedule);

        return scheduleMapper.toResponse(schedule);
    }

    @Override
    public ScheduleResponse findById(Long id) {

        Schedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el horario con id: " + id
                )
            );

        return scheduleMapper.toResponse(schedule);
    }

    @Override
    public List<ScheduleResponse> findAllByEmployee(Long employeeId) {

        employeeRepository.findById(employeeId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el empleado con id: " + employeeId
                )
            );

        return scheduleRepository
            .findAllByEmployeeIdAndStatus(
                employeeId,
                ScheduleStatus.ACTIVE
            )
            .stream()
            .map(scheduleMapper::toResponse)
            .toList();
    }

    @Override
    public ScheduleResponse update(
        Long id,
        UpdateScheduleRequest request
    ) {

        Schedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el horario con id: " + id
                )
            );

        validateTimeRange(
            request.getStartTime(),
            request.getEndTime()
        );

        scheduleMapper.updateEntity(request, schedule);

        schedule = scheduleRepository.save(schedule);

        return scheduleMapper.toResponse(schedule);
    }

    @Override
    public void delete(Long id) {

        Schedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el horario con id: " + id
                )
            );

        schedule.setStatus(ScheduleStatus.INACTIVE);

        scheduleRepository.save(schedule);
    }

    @Override
    public void activate(Long id) {

        Schedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el horario con id: " + id
                )
            );

        schedule.setStatus(ScheduleStatus.ACTIVE);

        scheduleRepository.save(schedule);
    }

    private void validateTimeRange(
        java.time.LocalTime startTime,
        java.time.LocalTime endTime
    ) {

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException(
                "La hora de inicio debe ser anterior a la hora de finalización."
            );
        }
    }
}
