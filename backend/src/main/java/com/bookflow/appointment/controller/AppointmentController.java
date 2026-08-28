package com.bookflow.appointment.controller;

import com.bookflow.appointment.dto.request.CreateAppointmentRequest;
import com.bookflow.appointment.dto.request.UpdateAppointmentRequest;
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

    @GetMapping("/company/{companyId}/{id}")
    public ResponseEntity<AppointmentResponse> findById(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        return ResponseEntity.ok(
            appointmentService.findById(companyId, id)
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
        @RequestParam(required = false) LocalDate appointmentDate
    ) {

        return ResponseEntity.ok(
            appointmentService.findAllByCompanyAndDate(
                companyId,
                appointmentDate
            )
        );
    }

    @PutMapping("/company/{companyId}/{id}")
    public ResponseEntity<AppointmentResponse> update(
        @PathVariable Long companyId,
        @PathVariable Long id,
        @Valid @RequestBody UpdateAppointmentRequest request
    ) {

        return ResponseEntity.ok(
            appointmentService.update(
                companyId,
                id,
                request
            )
        );
    }

    @PatchMapping("/company/{companyId}/{id}/confirm")
    public ResponseEntity<Void> confirm(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        appointmentService.confirm(companyId, id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/company/{companyId}/{id}/start")
    public ResponseEntity<Void> start(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        appointmentService.start(companyId, id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/company/{companyId}/{id}/complete")
    public ResponseEntity<Void> complete(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        appointmentService.complete(companyId, id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/company/{companyId}/{id}/no-show")
    public ResponseEntity<Void> noShow(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        appointmentService.noShow(companyId, id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/company/{companyId}/{id}/cancel")
    public ResponseEntity<Void> cancel(
        @PathVariable Long companyId,
        @PathVariable Long id
    ) {

        appointmentService.cancel(companyId, id);

        return ResponseEntity.noContent().build();
    }
}
