package com.bookflow.report.service;

import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.entity.AppointmentItem;
import com.bookflow.appointment.entity.AppointmentStatus;
import com.bookflow.appointment.repository.AppointmentRepository;
import com.bookflow.cash.entity.CashRegister;
import com.bookflow.cash.entity.CashRegisterStatus;
import com.bookflow.cash.repository.CashRegisterRepository;
import com.bookflow.client.entity.Client;
import com.bookflow.client.entity.ClientStatus;
import com.bookflow.client.repository.ClientRepository;
import com.bookflow.expense.entity.Expense;
import com.bookflow.expense.repository.ExpenseRepository;
import com.bookflow.payment.entity.Payment;
import com.bookflow.payment.entity.PaymentMethod;
import com.bookflow.payment.repository.PaymentRepository;
import com.bookflow.report.dto.response.DashboardSummaryResponse;
import com.bookflow.report.service.impl.ReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private ExpenseRepository expenseRepository;
    @Mock private CashRegisterRepository cashRegisterRepository;
    @Mock private ClientRepository clientRepository;
    @InjectMocks private ReportServiceImpl reportService;

    private Appointment appointment;
    private Payment payment;
    private Client client;

    @BeforeEach
    void setUp() {
        Client clientEntity = new Client();
        clientEntity.setId(10L);
        clientEntity.setFirstName("Juan");
        clientEntity.setLastName("Pérez");

        appointment = new Appointment();
        appointment.setId(1L);
        appointment.setClient(clientEntity);
        appointment.setAppointmentDate(LocalDate.now());
        appointment.setStartTime(LocalTime.of(10, 0));
        appointment.setEndTime(LocalTime.of(11, 0));
        appointment.setStatus(AppointmentStatus.COMPLETED);

        payment = new Payment();
        payment.setId(1L);
        payment.setAppointment(appointment);
        payment.setAmount(new BigDecimal("50000"));
        payment.setPaymentMethod(PaymentMethod.CASH);

        client = new Client();
        client.setId(10L);
        client.setFirstName("Juan");
        client.setLastName("Pérez");
        client.setStatus(ClientStatus.ACTIVE);
    }

    @Test
    void getDashboardSummary_returnsData() {
        when(appointmentRepository.findAllByCompanyIdAndAppointmentDate(eq(1L), any(LocalDate.class)))
            .thenReturn(List.of(appointment));
        when(appointmentRepository.findAllByCompanyIdAndAppointmentDateBetween(eq(1L), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(List.of(appointment));
        when(paymentRepository.findAllByAppointmentIdIn(anyList())).thenReturn(List.of(payment));
        when(expenseRepository.findAllByCompanyIdAndExpenseDateBetween(eq(1L), any(), any())).thenReturn(List.of());
        when(clientRepository.findAllByCompanyIdAndStatus(1L, ClientStatus.ACTIVE)).thenReturn(List.of(client));
        when(cashRegisterRepository.findByCompanyIdAndStatus(1L, CashRegisterStatus.OPEN)).thenReturn(Optional.empty());

        DashboardSummaryResponse result = reportService.getDashboardSummary(1L);

        assertNotNull(result);
        assertEquals(1L, result.getCompanyId());
        assertEquals(1, result.getTodayAppointments());
        assertEquals(new BigDecimal("50000"), result.getTodayPayments());
    }

    @Test
    void getDashboardSummary_withCashRegister() {
        CashRegister cashRegister = new CashRegister();
        cashRegister.setId(5L);
        cashRegister.setStatus(CashRegisterStatus.OPEN);
        cashRegister.setOpeningAmount(new BigDecimal("200000"));

        when(appointmentRepository.findAllByCompanyIdAndAppointmentDate(eq(1L), any(LocalDate.class)))
            .thenReturn(List.of());
        when(appointmentRepository.findAllByCompanyIdAndAppointmentDateBetween(eq(1L), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(List.of());
        when(expenseRepository.findAllByCompanyIdAndExpenseDateBetween(eq(1L), any(), any())).thenReturn(List.of());
        when(clientRepository.findAllByCompanyIdAndStatus(1L, ClientStatus.ACTIVE)).thenReturn(List.of());
        when(cashRegisterRepository.findByCompanyIdAndStatus(1L, CashRegisterStatus.OPEN))
            .thenReturn(Optional.of(cashRegister));

        DashboardSummaryResponse result = reportService.getDashboardSummary(1L);

        assertNotNull(result.getCashRegister());
        assertEquals(5L, result.getCashRegister().getId());
        assertEquals(new BigDecimal("200000"), result.getCashRegister().getOpeningAmount());
    }
}
