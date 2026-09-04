package com.bookflow.report.service.impl;

import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.entity.AppointmentItem;
import com.bookflow.appointment.entity.AppointmentStatus;
import com.bookflow.appointment.repository.AppointmentRepository;
import com.bookflow.expense.entity.Expense;
import com.bookflow.expense.repository.ExpenseRepository;
import com.bookflow.payment.entity.Payment;
import com.bookflow.payment.entity.PaymentMethod;
import com.bookflow.payment.repository.PaymentRepository;
import com.bookflow.report.dto.response.DailyReportResponse;
import com.bookflow.report.dto.response.DashboardSummaryResponse;
import com.bookflow.report.dto.response.MonthlyReportResponse;
import com.bookflow.report.service.ReportService;
import com.bookflow.cash.entity.CashRegister;
import com.bookflow.cash.entity.CashRegisterStatus;
import com.bookflow.cash.repository.CashRegisterRepository;
import com.bookflow.client.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final CashRegisterRepository cashRegisterRepository;
    private final ClientRepository clientRepository;

    @Override
    public DailyReportResponse getDailyReport(Long companyId, LocalDate date) {
        List<Appointment> appointments = appointmentRepository
            .findAllByCompanyIdAndAppointmentDate(companyId, date);
        List<Payment> allPayments = findPaymentsForAppointments(appointments);
        List<Expense> allExpenses = expenseRepository
            .findAllByCompanyIdAndExpenseDateBetween(
                companyId,
                date.atStartOfDay(),
                date.plusDays(1).atStartOfDay().minusNanos(1)
            );

        DailyReportResponse response = new DailyReportResponse();
        response.setCompanyId(companyId);
        response.setReportDate(date);

        fillAppointmentStats(response, appointments);
        fillPaymentStats(response, allPayments);
        fillExpenseStats(response, allExpenses);
        calculateNetResult(response);
        fillTopServices(response, appointments);

        return response;
    }

    @Override
    public MonthlyReportResponse getMonthlyReport(Long companyId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = YearMonth.of(year, month).atEndOfMonth();

        List<Appointment> appointments = appointmentRepository
            .findAllByCompanyIdAndAppointmentDateBetween(companyId, startDate, endDate);
        List<Long> aptIds = appointments.stream()
            .map(Appointment::getId).toList();
        List<Payment> allPayments = aptIds.isEmpty()
            ? List.of()
            : paymentRepository.findAllByAppointmentIdIn(aptIds);
        List<Expense> allExpenses = expenseRepository
            .findAllByCompanyIdAndExpenseDateBetween(
                companyId,
                startDate.atStartOfDay(),
                endDate.plusDays(1).atStartOfDay().minusNanos(1)
            );

        MonthlyReportResponse response = new MonthlyReportResponse();
        response.setCompanyId(companyId);
        response.setYear(year);
        response.setMonth(month);

        fillAppointmentStats(response, appointments);
        fillPaymentStats(response, allPayments);
        fillExpenseStats(response, allExpenses);
        calculateNetResult(response);
        fillDailyBreakdown(response, companyId, startDate, endDate, appointments);
        fillTopServicesMonthly(response, appointments);

        return response;
    }

    // ─── Shared helpers ───────────────────────────────────────

    private void fillAppointmentStats(DailyReportResponse r, List<Appointment> a) {
        r.setTotalAppointments(a.size());
        r.setCompletedAppointments(countByStatus(a, AppointmentStatus.COMPLETED));
        r.setCancelledAppointments(countByStatus(a, AppointmentStatus.CANCELLED));
        r.setNoShowAppointments(countByStatus(a, AppointmentStatus.NO_SHOW));
        r.setScheduledAppointments(countByStatus(a, AppointmentStatus.SCHEDULED));
    }

    private void fillAppointmentStats(MonthlyReportResponse r, List<Appointment> a) {
        r.setTotalAppointments(a.size());
        r.setCompletedAppointments(countByStatus(a, AppointmentStatus.COMPLETED));
        r.setCancelledAppointments(countByStatus(a, AppointmentStatus.CANCELLED));
        r.setNoShowAppointments(countByStatus(a, AppointmentStatus.NO_SHOW));
    }

    private int countByStatus(List<Appointment> list, AppointmentStatus status) {
        return (int) list.stream().filter(a -> a.getStatus() == status).count();
    }

    private void fillPaymentStats(DailyReportResponse r, List<Payment> p) {
        r.setCashPayments(sumByMethod(p, PaymentMethod.CASH));
        r.setCardPayments(sumByMethod(p, PaymentMethod.CARD));
        r.setTransferPayments(sumByMethod(p, PaymentMethod.TRANSFER));
        r.setOtherPayments(sumByMethod(p, PaymentMethod.OTHER));
        r.setTotalPayments(sumAll(p));
    }

    private void fillPaymentStats(MonthlyReportResponse r, List<Payment> p) {
        r.setCashPayments(sumByMethod(p, PaymentMethod.CASH));
        r.setCardPayments(sumByMethod(p, PaymentMethod.CARD));
        r.setTransferPayments(sumByMethod(p, PaymentMethod.TRANSFER));
        r.setOtherPayments(sumByMethod(p, PaymentMethod.OTHER));
        r.setTotalPayments(sumAll(p));
    }

    private void fillExpenseStats(DailyReportResponse r, List<Expense> e) {
        r.setCashExpenses(sumExpenseByMethod(e, PaymentMethod.CASH));
        r.setCardExpenses(sumExpenseByMethod(e, PaymentMethod.CARD));
        r.setTransferExpenses(sumExpenseByMethod(e, PaymentMethod.TRANSFER));
        r.setOtherExpenses(sumExpenseByMethod(e, PaymentMethod.OTHER));
        r.setTotalExpenses(e.stream().map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    private void fillExpenseStats(MonthlyReportResponse r, List<Expense> e) {
        r.setCashExpenses(sumExpenseByMethod(e, PaymentMethod.CASH));
        r.setCardExpenses(sumExpenseByMethod(e, PaymentMethod.CARD));
        r.setTransferExpenses(sumExpenseByMethod(e, PaymentMethod.TRANSFER));
        r.setOtherExpenses(sumExpenseByMethod(e, PaymentMethod.OTHER));
        r.setTotalExpenses(e.stream().map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    private void calculateNetResult(DailyReportResponse r) {
        r.setNetResult(subtract(r.getTotalPayments(), r.getTotalExpenses()));
    }

    private void calculateNetResult(MonthlyReportResponse r) {
        r.setNetResult(subtract(r.getTotalPayments(), r.getTotalExpenses()));
    }

    private BigDecimal subtract(BigDecimal a, BigDecimal b) {
        return (a != null ? a : BigDecimal.ZERO)
            .subtract(b != null ? b : BigDecimal.ZERO);
    }

    // ─── Top services ─────────────────────────────────────────

    private void fillTopServices(DailyReportResponse r, List<Appointment> appointments) {
        r.setTopServices(buildTopServices(appointments));
    }

    private void fillTopServicesMonthly(MonthlyReportResponse r, List<Appointment> appointments) {
        r.setTopServices(buildTopServicesMonthly(appointments));
    }

    private List<DailyReportResponse.ServiceSummary> buildTopServices(List<Appointment> appointments) {
        Map<Long, DailyReportResponse.ServiceSummary> map = new LinkedHashMap<>();
        for (Appointment apt : appointments) {
            if (apt.getStatus() != AppointmentStatus.COMPLETED) continue;
            for (AppointmentItem item : apt.getServices()) {
                Long key = item.getCatalog().getId();
                map.computeIfAbsent(key, k -> {
                    DailyReportResponse.ServiceSummary s = new DailyReportResponse.ServiceSummary();
                    s.setServiceId(item.getCatalog().getId());
                    s.setServiceName(item.getCatalog().getName());
                    s.setTimesSold(0);
                    s.setTotalRevenue(BigDecimal.ZERO);
                    return s;
                });
                DailyReportResponse.ServiceSummary s = map.get(key);
                s.setTimesSold(s.getTimesSold() + 1);
                s.setTotalRevenue(s.getTotalRevenue().add(item.getPrice()));
            }
        }
        return map.values().stream()
            .sorted((a, b) -> b.getTimesSold() - a.getTimesSold())
            .toList();
    }

    private List<MonthlyReportResponse.ServiceSummary> buildTopServicesMonthly(List<Appointment> appointments) {
        Map<Long, MonthlyReportResponse.ServiceSummary> map = new LinkedHashMap<>();
        for (Appointment apt : appointments) {
            if (apt.getStatus() != AppointmentStatus.COMPLETED) continue;
            for (AppointmentItem item : apt.getServices()) {
                Long key = item.getCatalog().getId();
                map.computeIfAbsent(key, k -> {
                    MonthlyReportResponse.ServiceSummary s = new MonthlyReportResponse.ServiceSummary();
                    s.setServiceId(item.getCatalog().getId());
                    s.setServiceName(item.getCatalog().getName());
                    s.setTimesSold(0);
                    s.setTotalRevenue(BigDecimal.ZERO);
                    return s;
                });
                MonthlyReportResponse.ServiceSummary s = map.get(key);
                s.setTimesSold(s.getTimesSold() + 1);
                s.setTotalRevenue(s.getTotalRevenue().add(item.getPrice()));
            }
        }
        return map.values().stream()
            .sorted((a, b) -> b.getTimesSold() - a.getTimesSold())
            .toList();
    }

    // ─── Daily breakdown (single query optimized) ─────────────

    private void fillDailyBreakdown(
        MonthlyReportResponse r,
        Long companyId,
        LocalDate start,
        LocalDate end,
        List<Appointment> allMonthAppointments
    ) {
        // Group appointments by day in memory (avoids N+1)
        Map<LocalDate, List<Appointment>> appointmentsByDay =
            allMonthAppointments.stream()
                .collect(Collectors.groupingBy(Appointment::getAppointmentDate));

        // Group payments by appointment in memory
        List<Long> allAptIds = allMonthAppointments.stream()
            .map(Appointment::getId).toList();
        Map<Long, List<Payment>> paymentsByAppointment =
            allAptIds.isEmpty()
                ? Map.of()
                : paymentRepository.findAllByAppointmentIdIn(allAptIds).stream()
                    .collect(Collectors.groupingBy(p -> p.getAppointment().getId()));

        List<MonthlyReportResponse.DailySummary> breakdown = new ArrayList<>();
        LocalDate current = start;
        while (!current.isAfter(end)) {
            final LocalDate day = current;
            List<Appointment> dayAppointments =
                appointmentsByDay.getOrDefault(day, List.of());

            long count = dayAppointments.size();

            BigDecimal dayPay = dayAppointments.stream()
                .flatMap(a -> paymentsByAppointment
                    .getOrDefault(a.getId(), List.of()).stream())
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal dayExp = dayAppointments.stream()
                .flatMap(a -> paymentsByAppointment
                    .getOrDefault(a.getId(), List.of()).stream())
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            MonthlyReportResponse.DailySummary s = new MonthlyReportResponse.DailySummary();
            s.setDay(day.getDayOfMonth());
            s.setAppointments((int) count);
            s.setPayments(dayPay);
            s.setExpenses(dayExp);
            breakdown.add(s);

            current = current.plusDays(1);
        }
        r.setDailyBreakdown(breakdown);
    }

    // ─── Utilities ────────────────────────────────────────────

    private List<Payment> findPaymentsForAppointments(List<Appointment> appointments) {
        List<Long> ids = appointments.stream().map(Appointment::getId).toList();
        if (ids.isEmpty()) return List.of();
        return paymentRepository.findAllByAppointmentIdIn(ids);
    }

    private BigDecimal sumByMethod(List<Payment> payments, PaymentMethod method) {
        return payments.stream()
            .filter(p -> p.getPaymentMethod() == method)
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumAll(List<Payment> payments) {
        return payments.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumExpenseByMethod(List<Expense> expenses, PaymentMethod method) {
        return expenses.stream()
            .filter(e -> e.getPaymentMethod() == method)
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ─── Dashboard Summary (single optimized query set) ──────

    @Override
    public DashboardSummaryResponse getDashboardSummary(Long companyId) {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());

        // 1 query for today's appointments
        List<Appointment> todayApts = appointmentRepository
            .findAllByCompanyIdAndAppointmentDate(companyId, today);

        // 1 query for month's appointments (for calendar heatmap + monthly stats)
        List<Appointment> monthApts = appointmentRepository
            .findAllByCompanyIdAndAppointmentDateBetween(companyId, monthStart, monthEnd);

        // 2 queries for payments (today + month)
        List<Long> todayAptIds = todayApts.stream().map(Appointment::getId).toList();
        List<Long> monthAptIds = monthApts.stream().map(Appointment::getId).toList();
        List<Payment> todayPayments = todayAptIds.isEmpty() ? List.of() : paymentRepository.findAllByAppointmentIdIn(todayAptIds);
        List<Payment> monthPayments = monthAptIds.isEmpty() ? List.of() : paymentRepository.findAllByAppointmentIdIn(monthAptIds);

        // 1 query for expenses (month range covers today too)
        List<Expense> monthExpenses = expenseRepository
            .findAllByCompanyIdAndExpenseDateBetween(
                companyId,
                monthStart.atStartOfDay(),
                monthEnd.plusDays(1).atStartOfDay().minusNanos(1)
            );
        List<Expense> todayExpenses = monthExpenses.stream()
            .filter(e -> e.getExpenseDate().toLocalDate().equals(today))
            .toList();

        // 1 query for client names
        Map<Long, String> clientMap = new java.util.HashMap<>();
        clientRepository.findAllByCompanyIdAndStatus(companyId, com.bookflow.client.entity.ClientStatus.ACTIVE)
            .forEach(c -> clientMap.put(c.getId(), (c.getFirstName() != null ? c.getFirstName() : "") + " " + (c.getLastName() != null ? c.getLastName() : "")));

        // 1 query for cash register
        CashRegister cashReg = cashRegisterRepository
            .findByCompanyIdAndStatus(companyId, CashRegisterStatus.OPEN)
            .orElse(null);

        // Build response
        DashboardSummaryResponse r = new DashboardSummaryResponse();
        r.setCompanyId(companyId);

        // Today stats
        r.setTodayPayments(sumAll(todayPayments));
        r.setTodayAppointments(todayApts.size());
        r.setCashPayments(sumByMethod(todayPayments, PaymentMethod.CASH));
        r.setCardPayments(sumByMethod(todayPayments, PaymentMethod.CARD));
        r.setTransferPayments(sumByMethod(todayPayments, PaymentMethod.TRANSFER));
        r.setOtherPayments(sumByMethod(todayPayments, PaymentMethod.OTHER));

        // Today expenses
        r.setCashExpenses(sumExpenseByMethod(todayExpenses, PaymentMethod.CASH));
        r.setCardExpenses(sumExpenseByMethod(todayExpenses, PaymentMethod.CARD));
        r.setTransferExpenses(sumExpenseByMethod(todayExpenses, PaymentMethod.TRANSFER));
        r.setOtherExpenses(sumExpenseByMethod(todayExpenses, PaymentMethod.OTHER));
        r.setTotalExpenses(todayExpenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
        r.setTodayNetResult(r.getTodayPayments().subtract(r.getTotalExpenses()));

        // Top services (completed today)
        List<DashboardSummaryResponse.TopServiceSummary> topSvc = new java.util.ArrayList<>();
        java.util.Map<Long, DashboardSummaryResponse.TopServiceSummary> svcMap = new java.util.LinkedHashMap<>();
        todayApts.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).forEach(apt -> {
            for (AppointmentItem item : apt.getServices()) {
                Long key = item.getCatalog().getId();
                svcMap.computeIfAbsent(key, k -> {
                    DashboardSummaryResponse.TopServiceSummary s = new DashboardSummaryResponse.TopServiceSummary();
                    s.setServiceId(item.getCatalog().getId());
                    s.setServiceName(item.getCatalog().getName());
                    s.setTimesSold(0);
                    s.setTotalRevenue(BigDecimal.ZERO);
                    return s;
                });
                DashboardSummaryResponse.TopServiceSummary s = svcMap.get(key);
                s.setTimesSold(s.getTimesSold() + 1);
                s.setTotalRevenue(s.getTotalRevenue().add(item.getPrice()));
            }
        });
        r.setTopServices(svcMap.values().stream().sorted((a, b) -> b.getTimesSold() - a.getTimesSold()).toList());

        // Today appointments list
        r.setTodayAppointmentsList(todayApts.stream().sorted((a, b) -> {
            String sa = a.getStartTime() != null ? a.getStartTime().toString() : "";
            String sb = b.getStartTime() != null ? b.getStartTime().toString() : "";
            return sa.compareTo(sb);
        }).map(apt -> {
            DashboardSummaryResponse.TodayAppointment t = new DashboardSummaryResponse.TodayAppointment();
            t.setId(apt.getId());
            Long clientId = apt.getClient() != null ? apt.getClient().getId() : null;
            t.setClientName(clientMap.getOrDefault(clientId, "Cliente #" + clientId));
            t.setStartTime(apt.getStartTime() != null ? apt.getStartTime().toString() : "");
            t.setEndTime(apt.getEndTime() != null ? apt.getEndTime().toString() : "");
            t.setStatus(apt.getStatus().name());
            t.setTotalPrice(apt.getServices().stream().map(AppointmentItem::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add));
            t.setServiceNames(apt.getServices().stream().map(i -> i.getCatalog().getName()).toList());
            return t;
        }).toList());

        // Recent appointments
        r.setRecentAppointments(todayApts.stream().sorted((a, b) -> {
            String sa = a.getStartTime() != null ? a.getStartTime().toString() : "";
            String sb = b.getStartTime() != null ? b.getStartTime().toString() : "";
            return sb.compareTo(sa);
        }).limit(5).map(apt -> {
            DashboardSummaryResponse.RecentAppointment ra = new DashboardSummaryResponse.RecentAppointment();
            Long clientId = apt.getClient() != null ? apt.getClient().getId() : null;
            ra.setClientName(clientMap.getOrDefault(clientId, "Cliente #" + clientId));
            ra.setTime(apt.getStartTime() != null ? apt.getStartTime().toString() : "");
            ra.setStatus(apt.getStatus().name());
            return ra;
        }).toList());

        // Appointment counts by date (calendar heatmap)
        java.util.Map<String, Integer> counts = new java.util.HashMap<>();
        monthApts.forEach(a -> {
            if (a.getAppointmentDate() != null) {
                counts.merge(a.getAppointmentDate().toString(), 1, Integer::sum);
            }
        });
        r.setAppointmentCountsByDate(counts);

        // Monthly summary
        r.setMonthlyPayments(sumAll(monthPayments));
        r.setMonthlyExpenses(monthExpenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
        r.setMonthlyNetResult(r.getMonthlyPayments().subtract(r.getMonthlyExpenses()));
        r.setMonthlyTotalAppointments(monthApts.size());
        r.setMonthlyCompletedAppointments(countByStatus(monthApts, AppointmentStatus.COMPLETED));
        r.setMonthlyCancelledAppointments(countByStatus(monthApts, AppointmentStatus.CANCELLED));

        // Cash register
        if (cashReg != null) {
            DashboardSummaryResponse.CashRegisterSummary cr = new DashboardSummaryResponse.CashRegisterSummary();
            cr.setId(cashReg.getId());
            cr.setStatus(cashReg.getStatus().name());
            cr.setOpeningAmount(cashReg.getOpeningAmount());
            r.setCashRegister(cr);
        }

        return r;
    }
}
