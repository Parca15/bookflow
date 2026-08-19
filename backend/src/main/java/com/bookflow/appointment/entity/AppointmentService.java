package com.bookflow.appointment.entity;

import com.bookflow.catalog.entity.Catalog;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "appointment_services")
@Getter
@Setter
public class AppointmentService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "appointment_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_appointment_service_appointment")
    )
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "catalog_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_appointment_service_catalog")
    )
    private Catalog catalog;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer durationMinutes;
}
