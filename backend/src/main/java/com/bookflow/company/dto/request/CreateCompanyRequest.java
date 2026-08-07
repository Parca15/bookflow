package com.bookflow.company.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCompanyRequest {

    @NotBlank
    private String businessName;

    private String documentNumber;

    private String email;

    private String phone;

    private String address;

}
