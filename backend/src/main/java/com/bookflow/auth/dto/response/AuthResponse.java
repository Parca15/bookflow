package com.bookflow.auth.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class AuthResponse {

    private String token;
    private String tokenType;
    private Long userId;
    private String email;
    private String fullName;
    private String role;
    private Integer roleLevel;
    private Long companyId;
    private String companyName;
    private Set<String> permissions;
}
