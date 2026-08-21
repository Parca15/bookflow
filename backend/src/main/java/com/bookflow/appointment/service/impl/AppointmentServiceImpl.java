package com.bookflow.appointment.service.impl;

import com.bookflow.appointment.dto.request.AppointmentServiceRequest;
import com.bookflow.appointment.dto.request.CreateAppointmentRequest;
import com.bookflow.appointment.dto.response.AppointmentResponse;
import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.entity.AppointmentItem;
import com.bookflow.appointment.entity.AppointmentStatus;
import com.bookflow.appointment.mapper.AppointmentMapper;
import com.bookflow.appointment.repository.AppointmentRepository;
import com.bookflow.appointment.service.AppointmentService;
import com.bookflow.catalog.entity.Catalog;
import com.bookflow.catalog.repository.CatalogRepository;
import com.bookflow.client.entity.Client;
import com.bookflow.client.repository.ClientRepository;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.employee.entity.Employee;
import com.bookflow.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bookflow.schedule.entity.Schedule;
import com.bookflow.schedule.entity.ScheduleDay;
import com.bookflow.schedule.entity.ScheduleStatus;
import com.bookflow.schedule.repository.ScheduleRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;

    private final CompanyRepository companyRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final CatalogRepository catalogRepository;
    private final ScheduleRepository scheduleRepository;

    @Override
    public AppointmentResponse create(
        Long companyId,
        CreateAppointmentRequest request
    ) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: "
                        + companyId
                )
            );

        Client client = clientRepository.findById(
            request.getClientId()
        ).orElseThrow(() ->
            new ResourceNotFoundException(
                "No se encontró el cliente con id: "
                    + request.getClientId()
            )
        );

        Employee employee = employeeRepository.findById(
            request.getEmployeeId()
        ).orElseThrow(() ->
            new ResourceNotFoundException(
                "No se encontró el empleado con id: "
                    + request.getEmployeeId()
            )
        );

        validateClientCompany(client, companyId);
        validateEmployeeCompany(employee, companyId);

        LocalTime endTime = calculateEndTime(
            companyId,
            request,
            request.getStartTime()
        );

        validateEmployeeSchedule(
            employee.getId(),
            request.getAppointmentDate(),
            request.getStartTime(),
            endTime
        );

        validateAppointmentOverlap(
            employee.getId(),
            request.getAppointmentDate(),
            request.getStartTime(),
            endTime
        );

        Appointment appointment = new Appointment();

        appointment.setCompany(company);
        appointment.setClient(client);
        appointment.setEmployee(employee);
        appointment.setAppointmentDate(
            request.getAppointmentDate()
        );
        appointment.setStartTime(
            request.getStartTime()
        );
        appointment.setEndTime(endTime);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setNotes(request.getNotes());

        List<AppointmentItem> appointmentItems =
            createAppointmentItems(
                appointment,
                companyId,
                request.getServices()
            );

        appointment.setServices(appointmentItems);

        appointment = appointmentRepository.save(appointment);

        return buildResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse findById(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la cita con id: " + id
                )
            );

        return buildResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> findAllByEmployeeAndDate(
        Long employeeId,
        LocalDate appointmentDate
    ) {

        return appointmentRepository
            .findAllByEmployeeIdAndAppointmentDate(
                employeeId,
                appointmentDate
            )
            .stream()
            .map(this::buildResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> findAllByClient(
        Long clientId
    ) {

        return appointmentRepository
            .findAllByClientId(clientId)
            .stream()
            .map(this::buildResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> findAllByCompanyAndDate(
        Long companyId,
        LocalDate appointmentDate
    ) {

        return appointmentRepository
            .findAllByCompanyIdAndAppointmentDate(
                companyId,
                appointmentDate
            )
            .stream()
            .map(this::buildResponse)
            .toList();
    }

    @Override
    public void cancel(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la cita con id: " + id
                )
            );

        appointment.setStatus(AppointmentStatus.CANCELLED);

        appointmentRepository.save(appointment);
    }

    private LocalTime calculateEndTime(
        Long companyId,
        CreateAppointmentRequest request,
        LocalTime startTime
    ) {

        int totalDuration = 0;

        for (AppointmentServiceRequest serviceRequest :
            request.getServices()) {

            Catalog catalog = catalogRepository.findById(
                serviceRequest.getCatalogId()
            ).orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el servicio con id: "
                        + serviceRequest.getCatalogId()
                )
            );

            validateCatalogCompany(catalog, companyId);

            totalDuration += catalog.getDurationMinutes();
        }

        return startTime.plusMinutes(totalDuration);
    }

    private List<AppointmentItem> createAppointmentItems(
        Appointment appointment,
        Long companyId,
        List<AppointmentServiceRequest> requests
    ) {

        List<AppointmentItem> items = new ArrayList<>();

        for (AppointmentServiceRequest request : requests) {

            Catalog catalog = catalogRepository.findById(
                request.getCatalogId()
            ).orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el servicio con id: "
                        + request.getCatalogId()
                )
            );

            validateCatalogCompany(catalog, companyId);

            AppointmentItem appointmentItem =
                new AppointmentItem();

            appointmentItem.setAppointment(appointment);
            appointmentItem.setCatalog(catalog);
            appointmentItem.setPrice(catalog.getPrice());
            appointmentItem.setDurationMinutes(
                catalog.getDurationMinutes()
            );

            items.add(appointmentItem);
        }

        return items;
    }

    private void validateClientCompany(
        Client client,
        Long companyId
    ) {

        if (!client.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException(
                "El cliente no pertenece a la empresa."
            );
        }
    }

    private void validateEmployeeCompany(
        Employee employee,
        Long companyId
    ) {

        if (!employee.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException(
                "El empleado no pertenece a la empresa."
            );
        }
    }

    private void validateCatalogCompany(
        Catalog catalog,
        Long companyId
    ) {

        if (!catalog.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException(
                "El servicio no pertenece a la empresa."
            );
        }

        if (catalog.getStatus() == null ||
            !"ACTIVE".equals(catalog.getStatus().name())) {

            throw new IllegalArgumentException(
                "El servicio seleccionado no está activo."
            );
        }
    }

    private void validateEmployeeSchedule(
        Long employeeId,
        LocalDate appointmentDate,
        LocalTime startTime,
        LocalTime endTime
    ) {
        ScheduleDay scheduleDay = convertToScheduleDay(
        appointmentDate
    );

    List<Schedule> schedules =
        scheduleRepository
            .findAllByEmployeeIdAndDayOfWeekAndStatus(
                employeeId,
                scheduleDay,
                ScheduleStatus.ACTIVE
            );

    if (schedules.isEmpty()) {
        throw new IllegalArgumentException(
            "El empleado no tiene horario disponible para ese día."
        );
    }

    boolean available = schedules.stream()
        .anyMatch(schedule ->
            !startTime.isBefore(schedule.getStartTime())
                &&
            !endTime.isAfter(schedule.getEndTime())
        );

    if (!available) {
        throw new IllegalArgumentException(
            "La cita está fuera del horario laboral del empleado."
        );
    }

    }

    private ScheduleDay convertToScheduleDay(
    LocalDate appointmentDate
) {

    return switch (appointmentDate.getDayOfWeek()) {

        case MONDAY -> ScheduleDay.MONDAY;
        case TUESDAY -> ScheduleDay.TUESDAY;
        case WEDNESDAY -> ScheduleDay.WEDNESDAY;
        case THURSDAY -> ScheduleDay.THURSDAY;
        case FRIDAY -> ScheduleDay.FRIDAY;
        case SATURDAY -> ScheduleDay.SATURDAY;
        case SUNDAY -> ScheduleDay.SUNDAY;
    };
}

    private void validateAppointmentOverlap(
        Long employeeId,
        LocalDate appointmentDate,
        LocalTime startTime,
        LocalTime endTime
    ) {

        boolean overlap =
            appointmentRepository
                .existsByEmployeeIdAndAppointmentDateAndStartTimeLessThanAndEndTimeGreaterThan(
                    employeeId,
                    appointmentDate,
                    endTime,
                    startTime
                );

        if (overlap) {
            throw new IllegalArgumentException(
                "El empleado ya tiene una cita en ese horario."
            );
        }
    }

    private AppointmentResponse buildResponse(
        Appointment appointment
    ) {

        AppointmentResponse response =
            appointmentMapper.toResponse(appointment);

        BigDecimal totalPrice = appointment.getServices()
            .stream()
            .map(AppointmentItem::getPrice)
            .reduce(
                BigDecimal.ZERO,
                BigDecimal::add
            );

        int totalDuration = appointment.getServices()
            .stream()
            .mapToInt(AppointmentItem::getDurationMinutes)
            .sum();

        response.setTotalPrice(totalPrice);
        response.setTotalDurationMinutes(totalDuration);

        return response;
    }
}
