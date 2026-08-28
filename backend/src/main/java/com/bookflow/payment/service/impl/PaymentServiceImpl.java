package com.bookflow.payment.service.impl;

import com.bookflow.appointment.entity.Appointment;
import com.bookflow.appointment.repository.AppointmentRepository;
import com.bookflow.cash.entity.CashRegister;
import com.bookflow.cash.entity.CashRegisterStatus;
import com.bookflow.cash.repository.CashRegisterRepository;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.payment.dto.request.CreatePaymentRequest;
import com.bookflow.payment.dto.response.PaymentResponse;
import com.bookflow.payment.entity.Payment;
import com.bookflow.payment.mapper.PaymentMapper;
import com.bookflow.payment.repository.PaymentRepository;
import com.bookflow.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl
    implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final AppointmentRepository appointmentRepository;
    private final CashRegisterRepository cashRegisterRepository;

    @Override
    public PaymentResponse create(
        Long companyId,
        Long appointmentId,
        CreatePaymentRequest request
    ) {

        Appointment appointment =
            findAppointment(companyId, appointmentId);

        CashRegister cashRegister =
            cashRegisterRepository
                .findByCompanyIdAndStatus(
                    companyId,
                    CashRegisterStatus.OPEN
                )
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "La empresa no tiene una caja abierta."
                    )
                );

        BigDecimal totalAppointment =
            appointment.getServices()
                .stream()
                .map(item -> item.getPrice())
                .reduce(
                    BigDecimal.ZERO,
                    BigDecimal::add
                );

        BigDecimal totalPaid =
            paymentRepository
                .calculateTotalByAppointmentId(
                    appointmentId
                );

        BigDecimal newTotal =
            totalPaid.add(request.getAmount());

        if (newTotal.compareTo(totalAppointment) > 0) {

            throw new IllegalArgumentException(
                "El abono supera el saldo pendiente de la cita."
            );
        }

        Payment payment = new Payment();

        payment.setAppointment(
            appointment
        );

        payment.setCashRegister(
            cashRegister
        );

        payment.setAmount(
            request.getAmount()
        );

        payment.setPaymentDate(
            LocalDateTime.now()
        );

        payment.setPaymentMethod(
            request.getPaymentMethod()
        );

        payment.setNotes(
            request.getNotes()
        );

        payment =
            paymentRepository.save(payment);

        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse findById(
        Long companyId,
        Long paymentId
    ) {

        Payment payment = paymentRepository
            .findByIdAndAppointmentCompanyId(
                paymentId,
                companyId
            )
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el abono con id: "
                        + paymentId
                )
            );

        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> findAllByAppointment(
        Long companyId,
        Long appointmentId
    ) {

        findAppointment(companyId, appointmentId);

        return paymentRepository
            .findAllByAppointmentId(appointmentId)
            .stream()
            .map(paymentMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalPaid(
        Long companyId,
        Long appointmentId
    ) {

        findAppointment(companyId, appointmentId);

        return paymentRepository
            .calculateTotalByAppointmentId(
                appointmentId
            );
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateBalance(
        Long companyId,
        Long appointmentId
    ) {

        Appointment appointment =
            findAppointment(companyId, appointmentId);

        BigDecimal totalAppointment =
            appointment.getServices()
                .stream()
                .map(item -> item.getPrice())
                .reduce(
                    BigDecimal.ZERO,
                    BigDecimal::add
                );

        BigDecimal totalPaid =
            paymentRepository
                .calculateTotalByAppointmentId(
                    appointmentId
                );

        return totalAppointment.subtract(
            totalPaid
        );
    }

    private Appointment findAppointment(
        Long companyId,
        Long appointmentId
    ) {

        return appointmentRepository
            .findByIdAndCompanyId(
                appointmentId,
                companyId
            )
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la cita con id: "
                        + appointmentId
                )
            );
    }
}
