package com.bookflow.invoice.service;

import com.bookflow.invoice.dto.response.InvoiceResponse;

public interface InvoiceService {

    InvoiceResponse create(
        Long companyId,
        Long appointmentId
    );

    InvoiceResponse findById(
        Long companyId,
        Long id
    );

    InvoiceResponse findByAppointmentId(
        Long companyId,
        Long appointmentId
    );

    void cancel(
        Long companyId,
        Long id
    );
}
