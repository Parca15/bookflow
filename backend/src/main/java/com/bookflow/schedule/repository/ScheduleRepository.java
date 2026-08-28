package com.bookflow.schedule.repository;

import com.bookflow.schedule.entity.Schedule;
import com.bookflow.schedule.entity.ScheduleDay;
import com.bookflow.schedule.entity.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

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

    @Query(
        "SELECT s FROM Schedule s " +
        "JOIN s.employee e " +
        "WHERE s.id = :id " +
        "AND e.company.id = :companyId"
    )
    Optional<Schedule> findByIdAndCompanyId(
        @Param("id") Long id,
        @Param("companyId") Long companyId
    );
}
