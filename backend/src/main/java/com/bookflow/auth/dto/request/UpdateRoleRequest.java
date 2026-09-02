package com.bookflow.auth.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateRoleRequest {

    @Size(max = 50, message = "El nombre no puede superar los 50 caracteres")
    private String name;

    @Size(max = 100, message = "El nombre para mostrar no puede superar los 100 caracteres")
    private String displayName;

    private Integer level;

    private Set<String> permissions;
}
