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
import com.bookflow.report.dto.response.MonthlyReportResponse;
import com.bookflow.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl
    implements ReportService {

    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    public DailyReportResponse getDailyReport(
        Long companyId,
        LocalDate date
    ) {

        List<Appointment> appointments =
            appointmentRepository
                .findAllByCompanyIdAndAppointmentDate(
                    companyId,
                    date
                );

        List<Payment> allPayments =
            findPaymentsForAppointments(appointments);

        List<Expense> allExpenses =
            expenseRepository.findAllByCompanyId(companyId)
                .stream()
                .filter(e ->
                    e.getExpenseDate().toLocalDate().equals(date)
                )
                .toList();

        DailyReportResponse response =
            new DailyReportResponse();

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
    public MonthlyReportResponse getMonthlyReport(
        Long companyId,
        int year,
        int month
    ) {

        LocalDate startDate =
            LocalDate.of(year, month, 1);

        LocalDate endDate =
            YearMonth.of(year, month).atEndOfMonth();

        List<Appointment> appointments =
            findAllAppointmentsInPeriod(
                companyId,
                startDate,
                endDate
            );

        List<Payment> allPayments =
            findPaymentsForAppointments(appointments);

        List<Expense> allExpenses =
            expenseRepository.findAllByCompanyId(companyId)
                .stream()
                .filter(e -> {
                    LocalDate expenseDate =
                        e.getExpenseDate().toLocalDate();
                    return !expenseDate.isBefore(startDate)
                        && !expenseDate.isAfter(endDate);
                })
                .toList();

        MonthlyReportResponse response =
            new MonthlyReportResponse();

        response.setCompanyId(companyId);
        response.setYear(year);
        response.setMonth(month);

        fillMonthlyAppointmentStats(
            response,
            appointments
        );
        fillMonthlyPaymentStats(response, allPayments);
        fillMonthlyExpenseStats(response, allExpenses);
        calculateMonthlyNetResult(response);
        fillDailyBreakdown(
            response,
            companyId,
            startDate,
            endDate
        );
        fillMonthlyTopServices(response, appointments);

        return response;
    }

    private void fillAppointmentStats(
        DailyReportResponse response,
        List<Appointment> appointments
    ) {

        response.setTotalAppointments(appointments.size());

        response.setCompletedAppointments(
            (int) appointments.stream()
                .filter(a ->
                    a.getStatus() == AppointmentStatus.COMPLETED
                )
                .count()
        );

        response.setCancelledAppointments(
            (int) appointments.stream()
                .filter(a ->
                    a.getStatus() == AppointmentStatus.CANCELLED
                )
                .count()
        );

        response.setNoShowAppointments(
            (int) appointments.stream()
                .filter(a ->
                    a.getStatus() == AppointmentStatus.NO_SHOW
                )
                .count()
        );

        response.setScheduledAppointments(
            (int) appointments.stream()
                .filter(a ->
                    a.getStatus() == AppointmentStatus.SCHEDULED
                )
                .count()
        );
    }

    private void fillPaymentStats(
        DailyReportResponse response,
        List<Payment> payments
    ) {

        response.setCashPayments(
            sumByMethod(payments, PaymentMethod.CASH)
        );

        response.setCardPayments(
            sumByMethod(payments, PaymentMethod.CARD)
        );

        response.setTransferPayments(
            sumByMethod(payments, PaymentMethod.TRANSFER)
        );

        response.setOtherPayments(
            sumByMethod(payments, PaymentMethod.OTHER)
        );

        response.setTotalPayments(
            payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
        );
    }

    private void fillExpenseStats(
        DailyReportResponse response,
        List<Expense> expenses
    ) {

        response.setCashExpenses(
            sumExpenseByMethod(expenses, PaymentMethod.CASH)
        );

        response.setCardExpenses(
            sumExpenseByMethod(expenses, PaymentMethod.CARD)
        );

        response.setTransferExpenses(
            sumExpenseByMethod(
                expenses,
                PaymentMethod.TRANSFER
            )
        );

        response.setOtherExpenses(
            sumExpenseByMethod(expenses, PaymentMethod.OTHER)
        );

        response.setTotalExpenses(
            expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
        );
    }

    private void calculateNetResult(
        DailyReportResponse response
    ) {

        BigDecimal totalPayments =
            response.getTotalPayments() != null
                ? response.getTotalPayments()
                : BigDecimal.ZERO;

        BigDecimal totalExpenses =
            response.getTotalExpenses() != null
                ? response.getTotalExpenses()
                : BigDecimal.ZERO;

        response.setNetResult(
            totalPayments.subtract(totalExpenses)
        );
    }

    private void fillTopServices(
        DailyReportResponse response,
        List<Appointment> appointments
    ) {

        Map<String, DailyReportResponse.ServiceSummary>
            serviceMap = new LinkedHashMap<>();

        for (Appointment appointment : appointments) {

            if (appointment.getStatus()
                != AppointmentStatus.COMPLETED) {
                continue;
            }

            for (AppointmentItem item
                : appointment.getServices()) {

                String key =
                    item.getCatalog().getId().toString();

                serviceMap.computeIfAbsent(
                    key,
                    k -> {
                        DailyReportResponse.ServiceSummary s =
                            new DailyReportResponse
                                .ServiceSummary();
                        s.setServiceId(
                            item.getCatalog().getId()
                        );
                        s.setServiceName(
                            item.getCatalog().getName()
                        );
                        s.setTimesSold(0);
                        s.setTotalRevenue(BigDecimal.ZERO);
                        return s;
                    }
                );

                DailyReportResponse.ServiceSummary s =
                    serviceMap.get(key);

                s.setTimesSold(s.getTimesSold() + 1);

                s.setTotalRevenue(
                    s.getTotalRevenue().add(item.getPrice())
                );
            }
        }

        response.setTopServices(
            serviceMap.values().stream()
                .sorted((a, b) ->
                    b.getTimesSold() - a.getTimesSold()
                )
                .toList()
        );
    }

    private void fillMonthlyAppointmentStats(
        MonthlyReportResponse response,
        List<Appointment> appointments
    ) {

        response.setTotalAppointments(appointments.size());

        response.setCompletedAppointments(
            (int) appointments.stream()
                .filter(a ->
                    a.getStatus() == AppointmentStatus.COMPLETED
                )
                .count()
        );

        response.setCancelledAppointments(
            (int) appointments.stream()
                .filter(a ->
                    a.getStatus() == AppointmentStatus.CANCELLED
                )
                .count()
        );

        response.setNoShowAppointments(
            (int) appointments.stream()
                .filter(a ->
                    a.getStatus() == AppointmentStatus.NO_SHOW
                )
                .count()
        );
    }

    private void fillMonthlyPaymentStats(
        MonthlyReportResponse response,
        List<Payment> payments
    ) {

        response.setCashPayments(
            sumByMethod(payments, PaymentMethod.CASH)
        );

        response.setCardPayments(
            sumByMethod(payments, PaymentMethod.CARD)
        );

        response.setTransferPayments(
            sumByMethod(payments, PaymentMethod.TRANSFER)
        );

        response.setOtherPayments(
            sumByMethod(payments, PaymentMethod.OTHER)
        );

        response.setTotalPayments(
            payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
        );
    }

    private void fillMonthlyExpenseStats(
        MonthlyReportResponse response,
        List<Expense> expenses
    ) {

        response.setCashExpenses(
            sumExpenseByMethod(expenses, PaymentMethod.CASH)
        );

        response.setCardExpenses(
            sumExpenseByMethod(expenses, PaymentMethod.CARD)
        );

        response.setTransferExpenses(
            sumExpenseByMethod(
                expenses,
                PaymentMethod.TRANSFER
            )
        );

        response.setOtherExpenses(
            sumExpenseByMethod(expenses, PaymentMethod.OTHER)
        );

        response.setTotalExpenses(
            expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
        );
    }

    private void calculateMonthlyNetResult(
        MonthlyReportResponse response
    ) {

        BigDecimal totalPayments =
            response.getTotalPayments() != null
                ? response.getTotalPayments()
                : BigDecimal.ZERO;

        BigDecimal totalExpenses =
            response.getTotalExpenses() != null
                ? response.getTotalExpenses()
                : BigDecimal.ZERO;

        response.setNetResult(
            totalPayments.subtract(totalExpenses)
        );
    }

    private void fillDailyBreakdown(
        MonthlyReportResponse response,
        Long companyId,
        LocalDate startDate,
        LocalDate endDate
    ) {

        List<MonthlyReportResponse.DailySummary>
            breakdown = new ArrayList<>();

        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {

            LocalDate date = current;

            List<Appointment> dayAppointments =
                appointmentRepository
                    .findAllByCompanyIdAndAppointmentDate(
                        companyId,
                        date
                    );

            List<Payment> dayPayments =
                findPaymentsForAppointments(
                    dayAppointments
                );

            List<Expense> dayExpenses =
                expenseRepository
                    .findAllByCompanyId(companyId)
                    .stream()
                    .filter(e ->
                        e.getExpenseDate()
                            .toLocalDate()
                            .equals(date)
                    )
                    .toList();

            MonthlyReportResponse.DailySummary summary =
                new MonthlyReportResponse.DailySummary();

            summary.setDay(date.getDayOfMonth());

            summary.setAppointments(
                dayAppointments.size()
            );

            summary.setPayments(
                dayPayments.stream()
                    .map(Payment::getAmount)
                    .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                    )
            );

            summary.setExpenses(
                dayExpenses.stream()
                    .map(Expense::getAmount)
                    .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                    )
            );

            breakdown.add(summary);

            current = current.plusDays(1);
        }

        response.setDailyBreakdown(breakdown);
    }

    private void fillMonthlyTopServices(
        MonthlyReportResponse response,
        List<Appointment> appointments
    ) {

        Map<String, MonthlyReportResponse.ServiceSummary>
            serviceMap = new LinkedHashMap<>();

        for (Appointment appointment : appointments) {

            if (appointment.getStatus()
                != AppointmentStatus.COMPLETED) {
                continue;
            }

            for (AppointmentItem item
                : appointment.getServices()) {

                String key =
                    item.getCatalog().getId().toString();

                serviceMap.computeIfAbsent(
                    key,
                    k -> {
                        MonthlyReportResponse.ServiceSummary s =
                            new MonthlyReportResponse
                                .ServiceSummary();
                        s.setServiceId(
                            item.getCatalog().getId()
                        );
                        s.setServiceName(
                            item.getCatalog().getName()
                        );
                        s.setTimesSold(0);
                        s.setTotalRevenue(BigDecimal.ZERO);
                        return s;
                    }
                );

                MonthlyReportResponse.ServiceSummary s =
                    serviceMap.get(key);

                s.setTimesSold(s.getTimesSold() + 1);

                s.setTotalRevenue(
                    s.getTotalRevenue().add(item.getPrice())
                );
            }
        }

        response.setTopServices(
            serviceMap.values().stream()
                .sorted((a, b) ->
                    b.getTimesSold() - a.getTimesSold()
                )
                .toList()
        );
    }

    private List<Payment> findPaymentsForAppointments(
        List<Appointment> appointments
    ) {

        return appointments.stream()
            .flatMap(a ->
                paymentRepository
                    .findAllByAppointmentId(a.getId())
                    .stream()
            )
            .toList();
    }

    private List<Appointment> findAllAppointmentsInPeriod(
        Long companyId,
        LocalDate startDate,
        LocalDate endDate
    ) {

        List<Appointment> all = new ArrayList<>();

        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {

            all.addAll(
                appointmentRepository
                    .findAllByCompanyIdAndAppointmentDate(
                        companyId,
                        current
                    )
            );

            current = current.plusDays(1);
        }

        return all;
    }

    private BigDecimal sumByMethod(
        List<Payment> payments,
        PaymentMethod method
    ) {

        return payments.stream()
            .filter(p -> p.getPaymentMethod() == method)
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumExpenseByMethod(
        List<Expense> expenses,
        PaymentMethod method
    ) {

        return expenses.stream()
            .filter(e -> e.getPaymentMethod() == method)
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
