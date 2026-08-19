package com.bookflow.schedule.dto.response;

import com.bookflow.schedule.entity.ScheduleDay;
import com.bookflow.schedule.entity.ScheduleStatus;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ScheduleResponse {

    private Long id;

    private Long employeeId;

    private ScheduleDay dayOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;

    private ScheduleStatus status;
}
