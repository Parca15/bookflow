package com.bookflow.employee.dto.response;

import lombok.Data;

@Data
public class EmployeeResponse {

    private Long id;

    private Long companyId;

    private String name;

    private String documentNumber;

    private String email;

    private String phone;

    private String position;

    private String status;
}
