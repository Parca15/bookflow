package com.bookflow.payment.service;

import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.entity.AppointmentItem;
import com.bookflow.appointment.repository.AppointmentRepository;
import com.bookflow.cash.entity.CashRegister;
import com.bookflow.cash.entity.CashRegisterStatus;
import com.bookflow.cash.repository.CashRegisterRepository;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.entity.CompanyStatus;
import com.bookflow.payment.dto.request.CreatePaymentRequest;
import com.bookflow.payment.dto.response.PaymentResponse;
import com.bookflow.payment.entity.Payment;
import com.bookflow.payment.entity.PaymentMethod;
import com.bookflow.payment.mapper.PaymentMapper;
import com.bookflow.payment.repository.PaymentRepository;
import com.bookflow.payment.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private CashRegisterRepository cashRegisterRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Company company;
    private CashRegister cashRegister;
    private Appointment appointment;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);
        company.setBusinessName("Test Company");
        company.setStatus(CompanyStatus.ACTIVE);

        cashRegister = new CashRegister();
        cashRegister.setId(1L);
        cashRegister.setCompany(company);
        cashRegister.setStatus(CashRegisterStatus.OPEN);

        appointment = new Appointment();
        appointment.setId(1L);
        appointment.setCompany(company);
        appointment.setServices(new ArrayList<>());
    }

    @Test
    void create_payment_success() {
        AppointmentItem item = new AppointmentItem();
        item.setPrice(new BigDecimal("100000"));
        appointment.getServices().add(item);

        when(appointmentRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(appointment));
        when(cashRegisterRepository
            .findByCompanyIdAndStatus(
                eq(1L), eq(CashRegisterStatus.OPEN)))
            .thenReturn(Optional.of(cashRegister));
        when(paymentRepository
            .calculateTotalByAppointmentId(1L))
            .thenReturn(BigDecimal.ZERO);
        when(paymentRepository.save(
            any(Payment.class)))
            .thenAnswer(invocation -> {
                Payment p = invocation.getArgument(0);
                p.setId(1L);
                return p;
            });

        var mockResponse = new PaymentResponse();
        mockResponse.setId(1L);
        mockResponse.setAmount(new BigDecimal("50000"));
        when(paymentMapper.toResponse(any(Payment.class)))
            .thenReturn(mockResponse);

        CreatePaymentRequest request =
            new CreatePaymentRequest();
        request.setAmount(new BigDecimal("50000"));
        request.setPaymentMethod(PaymentMethod.CASH);

        var response =
            paymentService.create(1L, 1L, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("50000"),
            response.getAmount());
    }

    @Test
    void create_payment_exceeds_balance() {
        AppointmentItem item = new AppointmentItem();
        item.setPrice(new BigDecimal("30000"));
        appointment.getServices().add(item);

        when(appointmentRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(appointment));
        when(cashRegisterRepository
            .findByCompanyIdAndStatus(
                eq(1L), eq(CashRegisterStatus.OPEN)))
            .thenReturn(Optional.of(cashRegister));
        when(paymentRepository
            .calculateTotalByAppointmentId(1L))
            .thenReturn(new BigDecimal("30000"));

        CreatePaymentRequest request =
            new CreatePaymentRequest();
        request.setAmount(new BigDecimal("50000"));
        request.setPaymentMethod(PaymentMethod.CASH);

        assertThrows(IllegalArgumentException.class,
            () -> paymentService.create(1L, 1L, request));
    }

    @Test
    void create_payment_appointment_not_found() {
        when(appointmentRepository
            .findByIdAndCompanyId(99L, 1L))
            .thenReturn(Optional.empty());

        CreatePaymentRequest request =
            new CreatePaymentRequest();
        request.setAmount(new BigDecimal("50000"));
        request.setPaymentMethod(PaymentMethod.CASH);

        assertThrows(ResourceNotFoundException.class,
            () -> paymentService.create(1L, 99L, request));
    }

    @Test
    void create_payment_no_open_cash_register() {
        when(appointmentRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(appointment));
        when(cashRegisterRepository
            .findByCompanyIdAndStatus(
                eq(1L), eq(CashRegisterStatus.OPEN)))
            .thenReturn(Optional.empty());

        CreatePaymentRequest request =
            new CreatePaymentRequest();
        request.setAmount(new BigDecimal("50000"));
        request.setPaymentMethod(PaymentMethod.CASH);

        assertThrows(ResourceNotFoundException.class,
            () -> paymentService.create(1L, 1L, request));
    }

    @Test
    void findById_payment_found() {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setAppointment(appointment);
        payment.setAmount(new BigDecimal("50000"));

        when(paymentRepository
            .findByIdAndAppointmentCompanyId(1L, 1L))
            .thenReturn(Optional.of(payment));

        var mockResponse = new PaymentResponse();
        mockResponse.setId(1L);
        when(paymentMapper.toResponse(any(Payment.class)))
            .thenReturn(mockResponse);

        var response =
            paymentService.findById(1L, 1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void findById_payment_not_found() {
        when(paymentRepository
            .findByIdAndAppointmentCompanyId(99L, 1L))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> paymentService.findById(1L, 99L));
    }

    @Test
    void calculateTotalPaid_success() {
        when(appointmentRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(appointment));
        when(paymentRepository
            .calculateTotalByAppointmentId(1L))
            .thenReturn(new BigDecimal("75000"));

        var total =
            paymentService.calculateTotalPaid(1L, 1L);

        assertEquals(new BigDecimal("75000"), total);
    }

    @Test
    void calculateBalance_success() {
        AppointmentItem item = new AppointmentItem();
        item.setPrice(new BigDecimal("50000"));
        appointment.getServices().add(item);

        when(appointmentRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(appointment));
        when(paymentRepository
            .calculateTotalByAppointmentId(1L))
            .thenReturn(new BigDecimal("30000"));

        var balance =
            paymentService.calculateBalance(1L, 1L);

        // balance = 50000 - 30000 = 20000
        assertEquals(new BigDecimal("20000"), balance);
    }

    @Test
    void calculateBalance_no_payments() {
        AppointmentItem item = new AppointmentItem();
        item.setPrice(new BigDecimal("50000"));
        appointment.getServices().add(item);

        when(appointmentRepository
            .findByIdAndCompanyId(1L, 1L))
            .thenReturn(Optional.of(appointment));
        when(paymentRepository
            .calculateTotalByAppointmentId(1L))
            .thenReturn(BigDecimal.ZERO);

        var balance =
            paymentService.calculateBalance(1L, 1L);

        // balance = 50000 - 0 = 50000
        assertEquals(new BigDecimal("50000"), balance);
    }

    @Test
    void calculateBalance_appointment_not_found() {
        when(appointmentRepository
            .findByIdAndCompanyId(99L, 1L))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> paymentService.calculateBalance(1L, 99L));
    }
}
