package com.bookflow.auth.service;

import com.bookflow.auth.dto.request.LoginRequest;
import com.bookflow.auth.dto.request.RegisterRequest;
import com.bookflow.auth.dto.response.AuthResponse;
import com.bookflow.auth.dto.response.UserResponse;

import java.util.List;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    List<UserResponse> findAllByCompany(Long companyId);
}
