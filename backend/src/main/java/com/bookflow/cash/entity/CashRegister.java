package com.bookflow.cash.entity;

import com.bookflow.company.entity.Company;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "cash_registers",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_cash_register_open_company",
            columnNames = {"company_id", "status"}
        )
    }
)
@Getter
@Setter
public class CashRegister {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "company_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_cash_register_company"
        )
    )
    private Company company;

    @Column(
        name = "opening_date",
        nullable = false
    )
    private LocalDateTime openingDate;

    @Column(name = "closing_date")
    private LocalDateTime closingDate;

    @Column(
        name = "opening_amount",
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal openingAmount;

    @Column(
        name = "closing_amount",
        precision = 12,
        scale = 2
    )
    private BigDecimal closingAmount;

    @Column(
        name = "expected_cash_amount",
        precision = 12,
        scale = 2
    )
    private BigDecimal expectedCashAmount;

    @Column(
        name = "cash_difference",
        precision = 12,
        scale = 2
    )
    private BigDecimal cashDifference;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 20
    )
    private CashRegisterStatus status;
}