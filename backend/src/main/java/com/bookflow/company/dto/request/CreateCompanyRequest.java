package com.bookflow.company.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCompanyRequest {

    @NotBlank(message = "El nombre de la empresa es obligatorio")
    @Size(max = 150, message = "El nombre de la empresa no puede superar los 150 caracteres")
    private String businessName;

    @NotNull(message = "El tipo de documento es obligatorio")
    private String documentType;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 30, message = "El número de documento no puede superar los 30 caracteres")
    private String documentNumber;

    @Email(message = "El correo electrónico no es válido")
    @Size(max = 120, message = "El correo electrónico no puede superar los 120 caracteres")
    private String email;

    @Size(max = 30, message = "El teléfono no puede superar los 30 caracteres")
    private String phone;

    @Size(max = 250, message = "La dirección no puede superar los 250 caracteres")
    private String address;

}
