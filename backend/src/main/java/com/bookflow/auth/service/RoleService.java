package com.bookflow.auth.service;

import com.bookflow.auth.dto.request.CreateRoleRequest;
import com.bookflow.auth.dto.request.UpdateRoleRequest;
import com.bookflow.auth.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {

    List<RoleResponse> getAllRoles(Long companyId, Long requestUserId);

    RoleResponse getRoleById(Long id);

    RoleResponse createRole(Long companyId, CreateRoleRequest request, Long requestUserId);

    RoleResponse updateRole(Long id, UpdateRoleRequest request, Long requestUserId);

    void deleteRole(Long id, Long requestUserId);

    List<String> getAvailableModules();
}
