package com.bookflow.report.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class DailyReportResponse {

    private Long companyId;

    private LocalDate reportDate;

    private int totalAppointments;

    private int completedAppointments;

    private int cancelledAppointments;

    private int noShowAppointments;

    private int scheduledAppointments;

    private BigDecimal totalPayments;

    private BigDecimal cashPayments;

    private BigDecimal cardPayments;

    private BigDecimal transferPayments;

    private BigDecimal otherPayments;

    private BigDecimal totalExpenses;

    private BigDecimal cashExpenses;

    private BigDecimal cardExpenses;

    private BigDecimal transferExpenses;

    private BigDecimal otherExpenses;

    private BigDecimal netResult;

    private List<ServiceSummary> topServices;

    @Data
    public static class ServiceSummary {

        private Long serviceId;

        private String serviceName;

        private int timesSold;

        private BigDecimal totalRevenue;
    }
}
