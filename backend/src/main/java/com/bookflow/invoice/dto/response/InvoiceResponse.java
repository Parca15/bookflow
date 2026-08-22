package com.bookflow.invoice.dto.response;

import com.bookflow.invoice.entity.InvoiceStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InvoiceResponse {

    private Long id;

    private Long appointmentId;

    private Long clientId;

    private String clientName;

    private String invoiceNumber;

    private LocalDateTime issueDate;

    private BigDecimal subtotal;

    private BigDecimal total;

    private BigDecimal totalPaid;

    private BigDecimal balance;

    private InvoiceStatus status;
}