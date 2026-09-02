package com.bookflow.auth.service.impl;

import com.bookflow.auth.dto.request.CreateRoleRequest;
import com.bookflow.auth.dto.request.UpdateRoleRequest;
import com.bookflow.auth.dto.response.RoleResponse;
import com.bookflow.auth.entity.PermissionModule;
import com.bookflow.auth.entity.Role;
import com.bookflow.auth.entity.User;
import com.bookflow.auth.repository.RoleRepository;
import com.bookflow.auth.repository.UserRepository;
import com.bookflow.auth.service.RoleService;
import com.bookflow.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles(Long companyId, Long requestUserId) {
        User requestUser = userRepository.findById(requestUserId)
            .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        List<Role> roles;
        if (requestUser.getRole().getLevel() >= 100) {
            // Super Admin ve todos los roles del sistema + de su empresa
            roles = roleRepository.findByCompanyIdOrCompanyIdIsNull(companyId);
        } else {
            // Otros ven roles del sistema + de su empresa
            roles = roleRepository.findByCompanyIdOrCompanyIdIsNull(companyId);
        }

        return roles.stream()
            .map(this::toResponse)
            .sorted(Comparator.comparing(RoleResponse::getLevel).reversed())
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Rol no encontrado"));
        return toResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse createRole(Long companyId, CreateRoleRequest request, Long requestUserId) {
        User requestUser = userRepository.findById(requestUserId)
            .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        Integer requestLevel = requestUser.getRole().getLevel();

        // Validar jerarquía: el nuevo rol debe tener nivel menor
        if (request.getLevel() >= requestLevel) {
            throw new BusinessException("No puedes crear un rol con nivel igual o superior al tuyo");
        }

        // Validar nombre único
        if (roleRepository.existsByNameAndCompanyId(request.getName(), companyId)) {
            throw new BusinessException("Ya existe un rol con ese nombre en la empresa");
        }

        // Validar que no intente asignar permisos que no tiene
        Set<PermissionModule> requestPermissions = requestUser.getRole().getPermissions();
        if (request.getPermissions() != null) {
            for (String perm : request.getPermissions()) {
                try {
                    PermissionModule module = PermissionModule.valueOf(perm);
                    if (!requestPermissions.contains(module)) {
                        throw new BusinessException("No tienes permiso para asignar: " + perm);
                    }
                } catch (IllegalArgumentException e) {
                    throw new BusinessException("Módulo de permiso no válido: " + perm);
                }
            }
        }

        Role role = Role.builder()
            .name(request.getName().toUpperCase().trim())
            .displayName(request.getDisplayName() != null ? request.getDisplayName().trim() : request.getName().trim())
            .level(request.getLevel())
            .isSystem(false)
            .company(companyId != null ? new com.bookflow.company.entity.Company() : null)
            .permissions(parsePermissions(request.getPermissions()))
            .build();

        if (companyId != null) {
            com.bookflow.company.entity.Company company = new com.bookflow.company.entity.Company();
            company.setId(companyId);
            role.setCompany(company);
        }

        role = roleRepository.save(role);
        return toResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long id, UpdateRoleRequest request, Long requestUserId) {
        User requestUser = userRepository.findById(requestUserId)
            .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Rol no encontrado"));

        // Validar jerarquía
        if (request.getLevel() != null && request.getLevel() >= requestUser.getRole().getLevel()) {
            throw new BusinessException("No puedes asignar un nivel igual o superior al tuyo");
        }

        // Validar permisos
        Set<PermissionModule> requestPermissions = requestUser.getRole().getPermissions();
        if (request.getPermissions() != null) {
            for (String perm : request.getPermissions()) {
                try {
                    PermissionModule module = PermissionModule.valueOf(perm);
                    if (!requestPermissions.contains(module)) {
                        throw new BusinessException("No tienes permiso para asignar: " + perm);
                    }
                } catch (IllegalArgumentException e) {
                    throw new BusinessException("Módulo de permiso no válido: " + perm);
                }
            }
        }

        if (request.getName() != null) role.setName(request.getName().toUpperCase().trim());
        if (request.getDisplayName() != null) role.setDisplayName(request.getDisplayName().trim());
        if (request.getLevel() != null) role.setLevel(request.getLevel());
        if (request.getPermissions() != null) role.setPermissions(parsePermissions(request.getPermissions()));

        role = roleRepository.save(role);
        return toResponse(role);
    }

    @Override
    @Transactional
    public void deleteRole(Long id, Long requestUserId) {
        User requestUser = userRepository.findById(requestUserId)
            .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Rol no encontrado"));

        // No se pueden eliminar roles del sistema
        if (Boolean.TRUE.equals(role.getIsSystem())) {
            throw new BusinessException("No se pueden eliminar roles del sistema");
        }

        // Verificar que no hay usuarios con este rol
        long userCount = userRepository.countByRoleId(id);
        if (userCount > 0) {
            throw new BusinessException("No se puede eliminar el rol porque tiene " + userCount + " usuario(s) asignado(s)");
        }

        // Validar jerarquía
        if (role.getLevel() >= requestUser.getRole().getLevel()) {
            throw new BusinessException("No puedes eliminar un rol con nivel igual o superior al tuyo");
        }

        roleRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAvailableModules() {
        return Arrays.stream(PermissionModule.values())
            .map(Enum::name)
            .collect(Collectors.toList());
    }

    private Set<PermissionModule> parsePermissions(Set<String> permissions) {
        if (permissions == null) return new HashSet<>();
        return permissions.stream()
            .map(PermissionModule::valueOf)
            .collect(Collectors.toSet());
    }

    private RoleResponse toResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setName(role.getName());
        response.setDisplayName(role.getDisplayName());
        response.setLevel(role.getLevel());
        response.setIsSystem(role.getIsSystem());
        response.setCompanyId(role.getCompany() != null ? role.getCompany().getId() : null);
        response.setPermissions(
            role.getPermissions().stream()
                .map(Enum::name)
                .collect(Collectors.toSet())
        );

        // Contar usuarios con este rol
        long count = userRepository.countByRoleId(role.getId());
        response.setUserCount((int) count);

        return response;
    }
}
