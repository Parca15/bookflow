package com.bookflow.appointment.controller;

import com.bookflow.appointment.dto.request.CreateAppointmentRequest;
import com.bookflow.appointment.dto.response.AppointmentResponse;
import com.bookflow.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/company/{companyId}")
    public ResponseEntity<AppointmentResponse> create(
        @PathVariable Long companyId,
        @Valid @RequestBody CreateAppointmentRequest request
    ) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                appointmentService.create(
                    companyId,
                    request
                )
            );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> findById(
        @PathVariable Long id
    ) {

        return ResponseEntity.ok(
            appointmentService.findById(id)
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AppointmentResponse>>
    findAllByEmployeeAndDate(
        @PathVariable Long employeeId,
        @RequestParam LocalDate appointmentDate
    ) {

        return ResponseEntity.ok(
            appointmentService.findAllByEmployeeAndDate(
                employeeId,
                appointmentDate
            )
        );
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<AppointmentResponse>>
    findAllByClient(
        @PathVariable Long clientId
    ) {

        return ResponseEntity.ok(
            appointmentService.findAllByClient(clientId)
        );
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<AppointmentResponse>>
    findAllByCompanyAndDate(
        @PathVariable Long companyId,
        @RequestParam LocalDate appointmentDate
    ) {

        return ResponseEntity.ok(
            appointmentService.findAllByCompanyAndDate(
                companyId,
                appointmentDate
            )
        );
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(
        @PathVariable Long id
    ) {

        appointmentService.cancel(id);

        return ResponseEntity.noContent().build();
    }
}