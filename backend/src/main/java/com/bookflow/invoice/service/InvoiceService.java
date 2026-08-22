package com.bookflow.invoice.service;

import com.bookflow.invoice.dto.response.InvoiceResponse;

public interface InvoiceService {

    InvoiceResponse create(
        Long appointmentId
    );

    InvoiceResponse findById(
        Long id
    );

    InvoiceResponse findByAppointmentId(
        Long appointmentId
    );

    void cancel(
        Long id
    );
}