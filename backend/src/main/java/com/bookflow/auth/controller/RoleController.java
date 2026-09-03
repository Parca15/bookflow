package com.bookflow.auth.controller;

import com.bookflow.auth.dto.request.CreateRoleRequest;
import com.bookflow.auth.dto.request.UpdateRoleRequest;
import com.bookflow.auth.dto.response.RoleResponse;
import com.bookflow.auth.entity.User;
import com.bookflow.auth.service.CurrentUserService;
import com.bookflow.auth.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<RoleResponse>> getAllRoles(
            @RequestParam Long companyId) {
        User user = currentUserService.getCurrentUser();
        List<RoleResponse> roles = roleService.getAllRoles(companyId, user.getId());
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.getRoleById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<RoleResponse> createRole(
            @RequestParam Long companyId,
            @Valid @RequestBody CreateRoleRequest request) {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(roleService.createRole(companyId, request, user.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(roleService.updateRole(id, request, user.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRole(
            @PathVariable Long id) {
        User user = currentUserService.getCurrentUser();
        roleService.deleteRole(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/modules")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<String>> getAvailableModules() {
        return ResponseEntity.ok(roleService.getAvailableModules());
    }
}
