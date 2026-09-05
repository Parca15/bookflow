package com.bookflow.appointment.entity;

import com.bookflow.client.entity.Client;
import com.bookflow.company.entity.Company;
import com.bookflow.employee.entity.Employee;
import com.bookflow.promotion.entity.Promotion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "appointments")
@Getter
@Setter
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "company_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_appointment_company"
        )
    )
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "client_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_appointment_client"
        )
    )
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "employee_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_appointment_employee"
        )
    )
    private Employee employee;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "promotion_id",
        foreignKey = @ForeignKey(
            name = "fk_appointment_promotion"
        )
    )
    private Promotion promotion;

    @Column(name = "coupon_discount_amount", precision = 12, scale = 2)
    private BigDecimal couponDiscountAmount;

    @Column(name = "coupon_applied_at")
    private java.time.LocalDateTime couponAppliedAt;

    @OneToMany(
        mappedBy = "appointment",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<AppointmentItem> services = new ArrayList<>();
}
