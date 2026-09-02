package com.bookflow.auth.dto.response;

import lombok.Data;

import java.util.Set;

@Data
public class RoleResponse {

    private Long id;

    private String name;

    private String displayName;

    private Integer level;

    private Boolean isSystem;

    private Long companyId;

    private Set<String> permissions;

    private Integer userCount;
}
