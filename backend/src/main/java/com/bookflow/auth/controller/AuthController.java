package com.bookflow.auth.controller;

import com.bookflow.auth.dto.request.LoginRequest;
import com.bookflow.auth.dto.request.RegisterRequest;
import com.bookflow.auth.dto.response.AuthResponse;
import com.bookflow.auth.dto.response.UserResponse;
import com.bookflow.auth.entity.User;
import com.bookflow.auth.service.AuthService;
import com.bookflow.auth.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;

    @PostMapping("/register")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<UserResponse>>
    findAllByCompany(
        @PathVariable Long companyId
    ) {

        return ResponseEntity.ok(
            authService.findAllByCompany(companyId)
        );
    }

    @PatchMapping("/users/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public void deactivateUser(
        @PathVariable Long id
    ) {
        User user = currentUserService.getCurrentUser();
        authService.deactivateUser(id, user.getId());
    }

    @PatchMapping("/users/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public void activateUser(@PathVariable Long id) {
        authService.activateUser(id);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public void deleteUser(
        @PathVariable Long id
    ) {
        User user = currentUserService.getCurrentUser();
        authService.deleteUser(id, user.getId());
    }
}
