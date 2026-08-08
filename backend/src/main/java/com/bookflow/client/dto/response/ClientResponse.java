package com.bookflow.client.dto.response;

import lombok.Data;

@Data
public class ClientResponse {

    private Long id;

    private Long companyId;

    private String firstName;

    private String lastName;

    private String documentType;

    private String documentNumber;

    private String phone;

    private String email;

    private String address;

    private String status;
}
