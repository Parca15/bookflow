package com.bookflow.client.history.service;

import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.entity.AppointmentItem;
import com.bookflow.appointment.entity.AppointmentStatus;
import com.bookflow.appointment.repository.AppointmentRepository;
import com.bookflow.catalog.entity.Catalog;
import com.bookflow.client.entity.Client;
import com.bookflow.client.history.dto.ClientHistoryResponse;
import com.bookflow.client.history.service.impl.ClientHistoryServiceImpl;
import com.bookflow.client.repository.ClientRepository;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.employee.entity.Employee;
import com.bookflow.invoice.entity.Invoice;
import com.bookflow.invoice.entity.InvoiceStatus;
import com.bookflow.invoice.repository.InvoiceRepository;
import com.bookflow.payment.repository.PaymentRepository;
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
class ClientHistoryServiceImplTest {

    @Mock private ClientRepository clientRepository;
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private PaymentRepository paymentRepository;
    @InjectMocks private ClientHistoryServiceImpl clientHistoryService;

    private Client client;
    private Appointment appointment;

    @BeforeEach
    void setUp() {
        client = new Client();
        client.setId(10L);
        client.setFirstName("Juan");
        client.setLastName("Pérez");
        client.setDocumentType("CC");
        client.setDocumentNumber("12345678");
        client.setPhone("3001234567");
        client.setEmail("juan@test.com");

        Employee employee = new Employee();
        employee.setName("María López");

        Catalog catalog = new Catalog();
        catalog.setId(1L);
        catalog.setName("Corte de Cabello");

        AppointmentItem item = new AppointmentItem();
        item.setCatalog(catalog);
        item.setPrice(new BigDecimal("30000"));
        item.setDurationMinutes(30);

        appointment = new Appointment();
        appointment.setId(100L);
        appointment.setClient(client);
        appointment.setEmployee(employee);
        appointment.setAppointmentDate(LocalDate.of(2025, 1, 15));
        appointment.setStartTime(LocalTime.of(10, 0));
        appointment.setEndTime(LocalTime.of(10, 30));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setServices(List.of(item));
    }

    @Test
    void findByClientId_success() {
        when(clientRepository.findByIdAndCompanyId(10L, 1L))
            .thenReturn(Optional.of(client));
        when(appointmentRepository.findAllByClientId(10L))
            .thenReturn(List.of(appointment));
        when(invoiceRepository.findByAppointmentId(100L))
            .thenReturn(Optional.empty());

        ClientHistoryResponse result = clientHistoryService.findByClientId(1L, 10L);

        assertNotNull(result);
        assertEquals(10L, result.getClientId());
        assertEquals("Juan Pérez", result.getClientName());
        assertEquals("CC", result.getDocumentType());
        assertEquals("12345678", result.getDocumentNumber());
        assertEquals(1, result.getAppointments().size());
    }

    @Test
    void findByClientId_clientNotFound_throws() {
        when(clientRepository.findByIdAndCompanyId(99L, 1L))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> clientHistoryService.findByClientId(1L, 99L));
    }

    @Test
    void findByClientId_withInvoice() {
        Invoice invoice = new Invoice();
        invoice.setId(200L);
        invoice.setInvoiceNumber("BF-000100");
        invoice.setTotal(new BigDecimal("30000"));
        invoice.setStatus(InvoiceStatus.ISSUED);

        when(clientRepository.findByIdAndCompanyId(10L, 1L))
            .thenReturn(Optional.of(client));
        when(appointmentRepository.findAllByClientId(10L))
            .thenReturn(List.of(appointment));
        when(invoiceRepository.findByAppointmentId(100L))
            .thenReturn(Optional.of(invoice));
        when(paymentRepository.calculateTotalByAppointmentId(100L))
            .thenReturn(new BigDecimal("15000"));

        ClientHistoryResponse result = clientHistoryService.findByClientId(1L, 10L);

        assertNotNull(result);
        ClientHistoryResponse.AppointmentHistoryResponse aptResponse =
            result.getAppointments().get(0);
        assertNotNull(aptResponse.getInvoice());
        assertEquals(new BigDecimal("15000"), aptResponse.getInvoice().getTotalPaid());
        assertEquals(new BigDecimal("15000"), aptResponse.getInvoice().getBalance());
    }

    @Test
    void findByClientId_noAppointments() {
        when(clientRepository.findByIdAndCompanyId(10L, 1L))
            .thenReturn(Optional.of(client));
        when(appointmentRepository.findAllByClientId(10L))
            .thenReturn(List.of());

        ClientHistoryResponse result = clientHistoryService.findByClientId(1L, 10L);

        assertNotNull(result);
        assertTrue(result.getAppointments().isEmpty());
    }

    @Test
    void mapAppointment_correctFields() {
        when(clientRepository.findByIdAndCompanyId(10L, 1L))
            .thenReturn(Optional.of(client));
        when(appointmentRepository.findAllByClientId(10L))
            .thenReturn(List.of(appointment));
        when(invoiceRepository.findByAppointmentId(100L))
            .thenReturn(Optional.empty());

        ClientHistoryResponse result = clientHistoryService.findByClientId(1L, 10L);

        ClientHistoryResponse.AppointmentHistoryResponse apt =
            result.getAppointments().get(0);
        assertEquals(100L, apt.getAppointmentId());
        assertEquals(LocalDate.of(2025, 1, 15), apt.getAppointmentDate());
        assertEquals(LocalTime.of(10, 0), apt.getStartTime());
        assertEquals(LocalTime.of(10, 30), apt.getEndTime());
        assertEquals("María López", apt.getEmployeeName());
        assertEquals("COMPLETED", apt.getStatus());
        assertEquals(1, apt.getServices().size());
        assertEquals("Corte de Cabello", apt.getServices().get(0).getServiceName());
    }
}
