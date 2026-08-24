package com.bookflow.client.history.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class ClientHistoryResponse {

    private Long clientId;

    private String clientName;

    private String documentType;

    private String documentNumber;

    private String phone;

    private String email;

    private List<AppointmentHistoryResponse> appointments;

    @Data
    public static class AppointmentHistoryResponse {

        private Long appointmentId;

        private LocalDate appointmentDate;

        private LocalTime startTime;

        private LocalTime endTime;

        private String employeeName;

        private String status;

        private List<ServiceHistoryResponse> services;

        private InvoiceHistoryResponse invoice;
    }

    @Data
    public static class ServiceHistoryResponse {

        private Long serviceId;

        private String serviceName;

        private BigDecimal price;

        private Integer durationMinutes;
    }

    @Data
    public static class InvoiceHistoryResponse {

        private Long invoiceId;

        private String invoiceNumber;

        private BigDecimal total;

        private BigDecimal totalPaid;

        private BigDecimal balance;

        private String status;
    }
}