package com.bookflow.auth.dto.response;

import com.bookflow.auth.entity.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {

    private Long id;
    private Long companyId;
    private String email;
    private String fullName;
    private String role;
    private Integer roleLevel;
    private UserStatus status;
    private LocalDateTime createdAt;
}
