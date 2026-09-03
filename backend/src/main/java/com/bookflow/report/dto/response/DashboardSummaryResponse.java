package com.bookflow.report.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DashboardSummaryResponse {

    private Long companyId;

    // Today's stats
    private BigDecimal todayPayments;
    private int todayAppointments;
    private BigDecimal todayNetResult;
    private int todayServicesSold;

    // Payment methods today
    private BigDecimal cashPayments;
    private BigDecimal cardPayments;
    private BigDecimal transferPayments;
    private BigDecimal otherPayments;

    // Expenses today
    private BigDecimal cashExpenses;
    private BigDecimal cardExpenses;
    private BigDecimal transferExpenses;
    private BigDecimal otherExpenses;
    private BigDecimal totalExpenses;

    // Monthly summary
    private BigDecimal monthlyPayments;
    private BigDecimal monthlyExpenses;
    private BigDecimal monthlyNetResult;
    private int monthlyTotalAppointments;
    private int monthlyCompletedAppointments;
    private int monthlyCancelledAppointments;

    // Today's appointments (with client names)
    private List<TodayAppointment> todayAppointmentsList;

    // Appointment counts by date (for calendar heatmap)
    private Map<String, Integer> appointmentCountsByDate;

    // Top services today
    private List<TopServiceSummary> topServices;

    // Recent appointments
    private List<RecentAppointment> recentAppointments;

    // Cash register
    private CashRegisterSummary cashRegister;

    @Data
    public static class TodayAppointment {
        private Long id;
        private String clientName;
        private String startTime;
        private String endTime;
        private String status;
        private BigDecimal totalPrice;
        private List<String> serviceNames;
    }

    @Data
    public static class TopServiceSummary {
        private Long serviceId;
        private String serviceName;
        private int timesSold;
        private BigDecimal totalRevenue;
    }

    @Data
    public static class RecentAppointment {
        private String clientName;
        private String time;
        private String status;
    }

    @Data
    public static class CashRegisterSummary {
        private Long id;
        private String status;
        private BigDecimal openingAmount;
        private BigDecimal totalPayments;
        private BigDecimal totalExpenses;
        private BigDecimal netResult;
    }
}
