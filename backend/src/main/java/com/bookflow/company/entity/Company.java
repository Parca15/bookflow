package com.bookflow.company.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_name", nullable = false, length = 150)
    private String businessName;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 20)
    private DocumentType documentType;

    @Column(name = "document_number", unique = true, length = 30)
    private String documentNumber;

    @Column(length = 120)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 250)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanyStatus status;
}
