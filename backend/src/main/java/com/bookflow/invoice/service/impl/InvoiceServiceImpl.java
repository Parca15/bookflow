package com.bookflow.invoice.service.impl;

import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.entity.AppointmentItem;
import com.bookflow.appointment.entity.AppointmentStatus;
import com.bookflow.appointment.repository.AppointmentRepository;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.invoice.dto.response.InvoiceResponse;
import com.bookflow.invoice.entity.Invoice;
import com.bookflow.invoice.entity.InvoiceStatus;
import com.bookflow.invoice.mapper.InvoiceMapper;
import com.bookflow.invoice.repository.InvoiceRepository;
import com.bookflow.invoice.service.InvoiceService;
import com.bookflow.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceServiceImpl
        implements InvoiceService {

    private final InvoiceRepository invoiceRepository;

    private final InvoiceMapper invoiceMapper;

    private final AppointmentRepository appointmentRepository;

    private final PaymentRepository paymentRepository;

    @Override
    public InvoiceResponse create(
        Long companyId,
        Long appointmentId
    ) {

        Appointment appointment =
            findAppointment(appointmentId, companyId);

        validateAppointmentCompleted(
            appointment
        );

        if (invoiceRepository.existsByAppointmentId(
            appointmentId
        )) {

            throw new IllegalArgumentException(
                "La cita ya tiene una factura."
            );
        }

        BigDecimal total =
            calculateAppointmentTotal(
                appointment
            );

        Invoice invoice = new Invoice();

        invoice.setAppointment(
            appointment
        );

        invoice.setInvoiceNumber(
            generateInvoiceNumber(
                appointmentId
            )
        );

        invoice.setIssueDate(
            LocalDateTime.now()
        );

        invoice.setSubtotal(
            total
        );

        invoice.setTotal(
            total
        );

        invoice.setStatus(
            InvoiceStatus.ISSUED
        );

        invoice =
            invoiceRepository.save(invoice);

        return buildResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse findById(
        Long companyId,
        Long id
    ) {

        Invoice invoice =
            findInvoice(id, companyId);

        return buildResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse findByAppointmentId(
        Long companyId,
        Long appointmentId
    ) {

        Invoice invoice =
            invoiceRepository
                .findByAppointmentIdAndCompanyId(
                    appointmentId,
                    companyId
                )
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "No se encontró una factura para la cita con id: "
                            + appointmentId
                    )
                );

        return buildResponse(invoice);
    }

    @Override
    public void cancel(
        Long companyId,
        Long id
    ) {

        Invoice invoice =
            findInvoice(id, companyId);

        if (invoice.getStatus() ==
            InvoiceStatus.CANCELLED) {

            throw new IllegalArgumentException(
                "La factura ya está cancelada."
            );
        }

        invoice.setStatus(
            InvoiceStatus.CANCELLED
        );
    }

    private Appointment findAppointment(
        Long appointmentId,
        Long companyId
    ) {

        return appointmentRepository
            .findByIdAndCompanyId(appointmentId, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la cita con id: "
                        + appointmentId
                )
            );
    }

    private Invoice findInvoice(
        Long id,
        Long companyId
    ) {

        return invoiceRepository
            .findByIdAndCompanyId(id, companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la factura con id: "
                        + id
                )
            );
    }

    private void validateAppointmentCompleted(
        Appointment appointment
    ) {

        if (appointment.getStatus() !=
            AppointmentStatus.COMPLETED) {

            throw new IllegalArgumentException(
                "Solo se puede facturar una cita completada."
            );
        }
    }

    private BigDecimal calculateAppointmentTotal(
        Appointment appointment
    ) {

        return appointment
            .getServices()
            .stream()
            .map(AppointmentItem::getPrice)
            .reduce(
                BigDecimal.ZERO,
                BigDecimal::add
            );
    }

    private String generateInvoiceNumber(
        Long appointmentId
    ) {

        return String.format(
            "BF-%06d",
            appointmentId
        );
    }

    private InvoiceResponse buildResponse(
        Invoice invoice
    ) {

        InvoiceResponse response =
            invoiceMapper.toResponse(
                invoice
            );

        BigDecimal totalPaid =
            paymentRepository
                .calculateTotalByAppointmentId(
                    invoice.getAppointment().getId()
                );

        BigDecimal balance =
            invoice.getTotal()
                .subtract(totalPaid);

        response.setTotalPaid(
            totalPaid
        );

        response.setBalance(
            balance
        );

        return response;
    }
}
