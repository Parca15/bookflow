package com.bookflow.company.dto.response;

import lombok.Data;

@Data
public class CompanyResponse {

    private Long id;

    private String businessName;

    private String documentType;

    private String documentNumber;

    private String email;

    private String phone;

    private String address;

    private String status;

}
