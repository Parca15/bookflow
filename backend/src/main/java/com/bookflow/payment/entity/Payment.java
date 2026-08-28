package com.bookflow.payment.entity;

import com.bookflow.appointment.entity.Appointment;
import com.bookflow.cash.entity.CashRegister;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "appointment_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_payment_appointment"
        )
    )
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "cash_register_id",
        foreignKey = @ForeignKey(
            name = "fk_payment_cash_register"
        )
    )
    private CashRegister cashRegister;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(
        name = "payment_date",
        nullable = false
    )
    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "payment_method",
        nullable = false,
        length = 30
    )
    private PaymentMethod paymentMethod;

    @Column(columnDefinition = "TEXT")
    private String notes;
}