package com.bookflow.invoice.service;

import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.entity.AppointmentItem;
import com.bookflow.appointment.entity.AppointmentStatus;
import com.bookflow.appointment.repository.AppointmentRepository;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.invoice.dto.response.InvoiceResponse;
import com.bookflow.invoice.entity.Invoice;
import com.bookflow.invoice.entity.InvoiceStatus;
import com.bookflow.invoice.mapper.InvoiceMapper;
import com.bookflow.invoice.repository.InvoiceRepository;
import com.bookflow.invoice.service.impl.InvoiceServiceImpl;
import com.bookflow.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceImplTest {

    @Mock private InvoiceRepository invoiceRepository;
    @Mock private InvoiceMapper invoiceMapper;
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private PaymentRepository paymentRepository;
    @InjectMocks private InvoiceServiceImpl invoiceService;

    private Appointment appointment;
    private Invoice invoice;
    private InvoiceResponse invoiceResponse;

    @BeforeEach
    void setUp() {
        appointment = new Appointment();
        appointment.setId(10L);
        appointment.setStatus(AppointmentStatus.COMPLETED);

        AppointmentItem item = new AppointmentItem();
        item.setPrice(new BigDecimal("50000"));
        appointment.setServices(List.of(item));

        invoice = new Invoice();
        invoice.setId(1L);
        invoice.setAppointment(appointment);
        invoice.setTotal(new BigDecimal("50000"));
        invoice.setStatus(InvoiceStatus.ISSUED);

        invoiceResponse = new InvoiceResponse();
        invoiceResponse.setId(1L);
        invoiceResponse.setTotal(new BigDecimal("50000"));
        invoiceResponse.setTotalPaid(BigDecimal.ZERO);
        invoiceResponse.setBalance(new BigDecimal("50000"));
    }

    @Test
    void create_success() {
        when(appointmentRepository.findByIdAndCompanyId(10L, 1L))
            .thenReturn(Optional.of(appointment));
        when(invoiceRepository.existsByAppointmentId(10L)).thenReturn(false);
        when(invoiceRepository.save(any())).thenReturn(invoice);
        when(invoiceMapper.toResponse(any())).thenReturn(invoiceResponse);
        when(paymentRepository.calculateTotalByAppointmentId(10L)).thenReturn(BigDecimal.ZERO);

        InvoiceResponse result = invoiceService.create(1L, 10L);

        assertNotNull(result);
        assertEquals(new BigDecimal("50000"), result.getTotal());
        verify(invoiceRepository).save(any());
    }

    @Test
    void create_appointmentNotCompleted_throws() {
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        when(appointmentRepository.findByIdAndCompanyId(10L, 1L))
            .thenReturn(Optional.of(appointment));

        assertThrows(IllegalArgumentException.class, () -> invoiceService.create(1L, 10L));
    }

    @Test
    void create_alreadyExists_throws() {
        when(appointmentRepository.findByIdAndCompanyId(10L, 1L))
            .thenReturn(Optional.of(appointment));
        when(invoiceRepository.existsByAppointmentId(10L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> invoiceService.create(1L, 10L));
    }

    @Test
    void create_appointmentNotFound_throws() {
        when(appointmentRepository.findByIdAndCompanyId(99L, 1L))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> invoiceService.create(1L, 99L));
    }

    @Test
    void findById_found() {
        when(invoiceRepository.findByIdAndCompanyId(1L, 1L)).thenReturn(Optional.of(invoice));
        when(invoiceMapper.toResponse(invoice)).thenReturn(invoiceResponse);
        when(paymentRepository.calculateTotalByAppointmentId(10L)).thenReturn(BigDecimal.ZERO);

        InvoiceResponse result = invoiceService.findById(1L, 1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void findById_notFound_throws() {
        when(invoiceRepository.findByIdAndCompanyId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> invoiceService.findById(1L, 99L));
    }

    @Test
    void cancel_success() {
        when(invoiceRepository.findByIdAndCompanyId(1L, 1L)).thenReturn(Optional.of(invoice));

        invoiceService.cancel(1L, 1L);

        assertEquals(InvoiceStatus.CANCELLED, invoice.getStatus());
    }

    @Test
    void cancel_alreadyCancelled_throws() {
        invoice.setStatus(InvoiceStatus.CANCELLED);
        when(invoiceRepository.findByIdAndCompanyId(1L, 1L)).thenReturn(Optional.of(invoice));

        assertThrows(IllegalArgumentException.class, () -> invoiceService.cancel(1L, 1L));
    }

    @Test
    void calculateTotal_multipleServices() {
        AppointmentItem item1 = new AppointmentItem();
        item1.setPrice(new BigDecimal("30000"));
        AppointmentItem item2 = new AppointmentItem();
        item2.setPrice(new BigDecimal("20000"));
        appointment.setServices(List.of(item1, item2));

        when(appointmentRepository.findByIdAndCompanyId(10L, 1L))
            .thenReturn(Optional.of(appointment));
        when(invoiceRepository.existsByAppointmentId(10L)).thenReturn(false);
        when(invoiceRepository.save(any())).thenReturn(invoice);
        when(invoiceMapper.toResponse(any())).thenReturn(invoiceResponse);
        when(paymentRepository.calculateTotalByAppointmentId(10L)).thenReturn(BigDecimal.ZERO);

        InvoiceResponse result = invoiceService.create(1L, 10L);

        assertEquals(new BigDecimal("50000"), result.getTotal());
    }
}
