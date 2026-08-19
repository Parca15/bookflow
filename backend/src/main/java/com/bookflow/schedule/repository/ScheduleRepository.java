package com.bookflow.schedule.repository;

import com.bookflow.schedule.entity.Schedule;
import com.bookflow.schedule.entity.ScheduleDay;
import com.bookflow.schedule.entity.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findAllByEmployeeIdAndStatus(
        Long employeeId,
        ScheduleStatus status
    );

    List<Schedule> findAllByEmployeeIdAndDayOfWeekAndStatus(
        Long employeeId,
        ScheduleDay dayOfWeek,
        ScheduleStatus status
    );
}
