package com.bookflow.client.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateClientRequest {

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

    @NotBlank
    @Size(max = 20)
    private String documentType;

    @Size(max = 30)
    private String documentNumber;

    @Size(max = 30)
    private String phone;

    @Email
    @Size(max = 120)
    private String email;

    @Size(max = 250)
    private String address;
}
