package com.bookflow.report.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class MonthlyReportResponse {

    private Long companyId;

    private int year;

    private int month;

    private int totalAppointments;

    private int completedAppointments;

    private int cancelledAppointments;

    private int noShowAppointments;

    private int newClients;

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

    private List<DailySummary> dailyBreakdown;

    private List<ServiceSummary> topServices;

    @Data
    public static class DailySummary {

        private int day;

        private int appointments;

        private BigDecimal payments;

        private BigDecimal expenses;
    }

    @Data
    public static class ServiceSummary {

        private Long serviceId;

        private String serviceName;

        private int timesSold;

        private BigDecimal totalRevenue;
    }
}
