package com.bookflow.auth.dto.response;

import com.bookflow.auth.entity.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {

    private String token;
    private String tokenType;
    private Long userId;
    private String email;
    private String fullName;
    private UserRole role;
    private Long companyId;
    private String companyName;
}
