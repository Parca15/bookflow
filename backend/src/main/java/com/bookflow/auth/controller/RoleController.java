package com.bookflow.auth.controller;

import com.bookflow.auth.dto.request.CreateRoleRequest;
import com.bookflow.auth.dto.request.UpdateRoleRequest;
import com.bookflow.auth.dto.response.RoleResponse;
import com.bookflow.auth.entity.User;
import com.bookflow.auth.repository.UserRepository;
import com.bookflow.auth.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles(
            @RequestParam Long companyId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        List<RoleResponse> roles = roleService.getAllRoles(companyId, user.getId());
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.getRoleById(id));
    }

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(
            @RequestParam Long companyId,
            @Valid @RequestBody CreateRoleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(roleService.createRole(companyId, request, user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(roleService.updateRole(id, request, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        roleService.deleteRole(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/modules")
    public ResponseEntity<List<String>> getAvailableModules() {
        return ResponseEntity.ok(roleService.getAvailableModules());
    }
}
