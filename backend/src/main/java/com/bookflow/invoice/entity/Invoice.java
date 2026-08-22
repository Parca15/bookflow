package com.bookflow.invoice.entity;

import com.bookflow.appointment.entity.Appointment;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "invoices",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_invoice_appointment",
            columnNames = "appointment_id"
        ),
        @UniqueConstraint(
            name = "uk_invoice_number",
            columnNames = "invoice_number"
        )
    }
)
@Getter
@Setter
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "appointment_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_invoice_appointment"
        )
    )
    private Appointment appointment;

    @Column(
        name = "invoice_number",
        nullable = false,
        length = 30
    )
    private String invoiceNumber;

    @Column(
        name = "issue_date",
        nullable = false
    )
    private LocalDateTime issueDate;

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal subtotal;

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 20
    )
    private InvoiceStatus status;
}