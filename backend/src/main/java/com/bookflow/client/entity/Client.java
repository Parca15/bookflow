package com.bookflow.client.entity;

import com.bookflow.company.entity.Company;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "clients",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_client_company_document",
            columnNames = {"company_id", "document_number"}
        )
    }
)
@Getter
@Setter
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "company_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_client_company")
    )
    private Company company;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "document_type", nullable = false, length = 20)
    private String documentType;

    @Column(name = "document_number", length = 30)
    private String documentNumber;

    @Column(length = 30)
    private String phone;

    @Column(length = 120)
    private String email;

    @Column(length = 250)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ClientStatus status;
}
