package com.bookflow.client.history.service.impl;

import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.entity.AppointmentItem;
import com.bookflow.appointment.repository.AppointmentRepository;
import com.bookflow.client.entity.Client;
import com.bookflow.client.history.dto.ClientHistoryResponse;
import com.bookflow.client.repository.ClientRepository;
import com.bookflow.invoice.entity.Invoice;
import com.bookflow.invoice.repository.InvoiceRepository;
import com.bookflow.payment.repository.PaymentRepository;
import com.bookflow.client.history.service.ClientHistoryService;
import com.bookflow.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClientHistoryServiceImpl
    implements ClientHistoryService {

    private final ClientRepository clientRepository;

    private final AppointmentRepository appointmentRepository;

    private final InvoiceRepository invoiceRepository;

    private final PaymentRepository paymentRepository;

    @Override
    public ClientHistoryResponse findByClientId(
        Long companyId,
        Long clientId
    ) {

        Client client =
            clientRepository.findByIdAndCompanyId(clientId, companyId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "No se encontró el cliente con id: "
                            + clientId
                    )
                );

        List<Appointment> appointments =
            appointmentRepository.findAllByClientId(
                clientId
            );

        ClientHistoryResponse response =
            new ClientHistoryResponse();

        response.setClientId(
            client.getId()
        );

        response.setClientName(
            client.getFirstName()
                + " "
                + client.getLastName()
        );

        response.setDocumentType(
            client.getDocumentType()
        );

        response.setDocumentNumber(
            client.getDocumentNumber()
        );

        response.setPhone(
            client.getPhone()
        );

        response.setEmail(
            client.getEmail()
        );

        response.setAppointments(
            appointments.stream()
                .map(this::mapAppointment)
                .toList()
        );

        return response;
    }

    private ClientHistoryResponse.AppointmentHistoryResponse
    mapAppointment(
        Appointment appointment
    ) {

        ClientHistoryResponse
            .AppointmentHistoryResponse response =
            new ClientHistoryResponse
                .AppointmentHistoryResponse();

        response.setAppointmentId(
            appointment.getId()
        );

        response.setAppointmentDate(
            appointment.getAppointmentDate()
        );

        response.setStartTime(
            appointment.getStartTime()
        );

        response.setEndTime(
            appointment.getEndTime()
        );

        response.setEmployeeName(
            appointment.getEmployee()
                .getName()
        );

        response.setStatus(
            appointment.getStatus().name()
        );

        response.setServices(
            appointment.getServices()
                .stream()
                .map(this::mapService)
                .toList()
        );

        response.setInvoice(
            mapInvoice(appointment)
        );

        return response;
    }

    private ClientHistoryResponse.ServiceHistoryResponse
    mapService(
        AppointmentItem item
    ) {

        ClientHistoryResponse
            .ServiceHistoryResponse response =
            new ClientHistoryResponse
                .ServiceHistoryResponse();

        response.setServiceId(
            item.getCatalog().getId()
        );

        response.setServiceName(
            item.getCatalog().getName()
        );

        response.setPrice(
            item.getPrice()
        );

        response.setDurationMinutes(
            item.getDurationMinutes()
        );

        return response;
    }

    private ClientHistoryResponse.InvoiceHistoryResponse
    mapInvoice(
        Appointment appointment
    ) {

        Invoice invoice =
            invoiceRepository
                .findByAppointmentId(
                    appointment.getId()
                )
                .orElse(null);

        if (invoice == null) {
            return null;
        }

        BigDecimal totalPaid =
            paymentRepository
                .calculateTotalByAppointmentId(
                    appointment.getId()
                );

        BigDecimal balance =
            invoice.getTotal()
                .subtract(totalPaid);

        ClientHistoryResponse
            .InvoiceHistoryResponse response =
            new ClientHistoryResponse
                .InvoiceHistoryResponse();

        response.setInvoiceId(
            invoice.getId()
        );

        response.setInvoiceNumber(
            invoice.getInvoiceNumber()
        );

        response.setTotal(
            invoice.getTotal()
        );

        response.setTotalPaid(
            totalPaid
        );

        response.setBalance(
            balance
        );

        response.setStatus(
            invoice.getStatus().name()
        );

        return response;
    }
}
