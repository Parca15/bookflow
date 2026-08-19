package com.bookflow.employee.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateEmployeeRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 30)
    private String documentNumber;

    @Email
    @Size(max = 120)
    private String email;

    @Size(max = 30)
    private String phone;

    @NotBlank
    @Size(max = 100)
    private String position;
}
