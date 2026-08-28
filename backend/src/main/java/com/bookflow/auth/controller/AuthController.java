package com.bookflow.auth.controller;

import com.bookflow.auth.dto.request.LoginRequest;
import com.bookflow.auth.dto.request.RegisterRequest;
import com.bookflow.auth.dto.response.AuthResponse;
import com.bookflow.auth.dto.response.UserResponse;
import com.bookflow.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
        @Valid @RequestBody RegisterRequest request
    ) {

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request
    ) {

        return ResponseEntity.ok(
            authService.login(request)
        );
    }

    @GetMapping(
        "/companies/{companyId}/users"
    )
    public ResponseEntity<List<UserResponse>>
    findAllByCompany(
        @PathVariable Long companyId
    ) {

        return ResponseEntity.ok(
            authService.findAllByCompany(companyId)
        );
    }
}
