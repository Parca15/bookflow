package com.bookflow.invoice.mapper;

import com.bookflow.invoice.dto.response.InvoiceResponse;
import com.bookflow.invoice.entity.Invoice;
import org.springframework.stereotype.Component;

@Component
public class InvoiceMapper {

    public InvoiceResponse toResponse(
        Invoice invoice
    ) {

        InvoiceResponse response =
            new InvoiceResponse();

        response.setId(
            invoice.getId()
        );

        response.setAppointmentId(
            invoice.getAppointment().getId()
        );

        response.setClientId(
            invoice.getAppointment()
                .getClient()
                .getId()
        );

        response.setClientName(
            invoice.getAppointment()
                .getClient()
                .getFirstName()
                + " "
                + invoice.getAppointment()
                    .getClient()
                    .getLastName()
        );

        response.setInvoiceNumber(
            invoice.getInvoiceNumber()
        );

        response.setIssueDate(
            invoice.getIssueDate()
        );

        response.setSubtotal(
            invoice.getSubtotal()
        );

        response.setTotal(
            invoice.getTotal()
        );

        response.setStatus(
            invoice.getStatus()
        );

        return response;
    }
}