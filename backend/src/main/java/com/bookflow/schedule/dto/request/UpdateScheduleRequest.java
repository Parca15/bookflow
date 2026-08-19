package com.bookflow.schedule.dto.request;

import com.bookflow.schedule.entity.ScheduleDay;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class UpdateScheduleRequest {

    @NotNull
    private ScheduleDay dayOfWeek;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;
}
