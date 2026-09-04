package com.bookflow.auth.service.impl;

import com.bookflow.auth.dto.request.LoginRequest;
import com.bookflow.auth.dto.request.RegisterRequest;
import com.bookflow.auth.dto.response.AuthResponse;
import com.bookflow.auth.dto.response.UserResponse;
import com.bookflow.auth.entity.Role;
import com.bookflow.auth.entity.User;
import com.bookflow.auth.entity.UserStatus;
import com.bookflow.auth.repository.RoleRepository;
import com.bookflow.auth.repository.UserRepository;
import com.bookflow.auth.security.JwtTokenProvider;
import com.bookflow.auth.service.AuthService;
import com.bookflow.common.exception.BusinessException;
import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByCompanyIdAndEmail(
            request.getCompanyId(),
            request.getEmail()
        )) {
            throw new ResourceAlreadyExistsException(
                "Ya existe un usuario con ese email en la empresa."
            );
        }

        User currentUser = org.springframework.security.core.context.SecurityContextHolder
            .getContext().getAuthentication() != null
            ? userRepository.findByEmailWithRole(
                org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName()
            ).orElse(null)
            : null;

        if (currentUser != null && currentUser.getRole().getLevel() < 100) {
            if (!currentUser.getCompany().getId().equals(request.getCompanyId())) {
                throw new com.bookflow.common.exception.BusinessException(
                    "Solo puedes crear usuarios en tu propia empresa."
                );
            }
        }

        Company company = companyRepository
            .findById(request.getCompanyId())
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: "
                        + request.getCompanyId()
                )
            );

        Role role = roleRepository.findById(request.getRoleId())
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el rol con id: "
                        + request.getRoleId()
                )
            );

        if (currentUser != null && currentUser.getRole().getLevel() < 100) {
            if (role.getLevel() >= currentUser.getRole().getLevel()) {
                throw new com.bookflow.common.exception.BusinessException(
                    "No puedes asignar un rol con nivel igual o superior al tuyo."
                );
            }
            if (Boolean.TRUE.equals(role.getIsSystem())) {
                if (role.getCompany() != null && !role.getCompany().getId().equals(request.getCompanyId())) {
                    throw new com.bookflow.common.exception.BusinessException(
                        "No puedes asignar un rol del sistema que pertenece a otra empresa."
                    );
                }
            }
        }

        User user = User.builder()
            .company(company)
            .email(request.getEmail())
            .password(
                passwordEncoder.encode(
                    request.getPassword()
                )
            )
            .fullName(request.getFullName())
            .role(role)
            .status(UserStatus.ACTIVE)
            .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(
            user.getEmail()
        );

        return buildAuthResponse(user, token);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        Authentication authentication =
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

        String token =
            jwtTokenProvider.generateToken(authentication);

        User user = userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "Usuario no encontrado."
                )
            );

        return buildAuthResponse(user, token);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAllByCompany(
        Long companyId
    ) {

        companyRepository.findById(companyId)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: "
                        + companyId
                )
            );

        return userRepository.findByCompanyId(companyId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el usuario con id: " + id
                )
            );
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    @Override
    public void deactivateUser(Long id, Long requestUserId) {
        if (id.equals(requestUserId)) {
            throw new BusinessException("No puedes desactivarte a ti mismo");
        }
        deactivateUser(id);
    }

    @Override
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el usuario con id: " + id
                )
            );
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el usuario con id: " + id
                )
            );
        userRepository.deleteById(id);
    }

    @Override
    public void deleteUser(Long id, Long requestUserId) {
        if (id.equals(requestUserId)) {
            throw new BusinessException("No puedes eliminarte a ti mismo");
        }
        deleteUser(id);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole().getName())
            .roleLevel(user.getRole().getLevel())
            .companyId(user.getCompany().getId())
            .companyName(user.getCompany().getBusinessName())
            .permissions(
                user.getRole().getPermissions() != null
                    ? user.getRole().getPermissions().stream()
                        .map(Enum::name)
                        .collect(Collectors.toSet())
                    : java.util.Collections.emptySet()
            )
            .build();
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .companyId(user.getCompany().getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole().getName())
            .roleLevel(user.getRole().getLevel())
            .status(user.getStatus())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
