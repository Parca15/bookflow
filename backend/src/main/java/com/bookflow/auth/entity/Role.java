package com.bookflow.auth.entity;

import com.bookflow.company.entity.Company;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(nullable = false)
    private Integer level;

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        uniqueConstraints = @UniqueConstraint(
            name = "uk_role_permission",
            columnNames = {"role_id", "module"}
        )
    )
    @Column(name = "module", nullable = false)
    @Enumerated(EnumType.STRING)
    private Set<PermissionModule> permissions = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
