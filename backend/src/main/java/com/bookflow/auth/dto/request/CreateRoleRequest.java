package com.bookflow.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class CreateRoleRequest {

    @NotBlank(message = "El nombre del rol es obligatorio")
    @Size(max = 50, message = "El nombre no puede superar los 50 caracteres")
    private String name;

    @Size(max = 100, message = "El nombre para mostrar no puede superar los 100 caracteres")
    private String displayName;

    @NotNull(message = "El nivel es obligatorio")
    private Integer level;

    private Set<String> permissions;
}
