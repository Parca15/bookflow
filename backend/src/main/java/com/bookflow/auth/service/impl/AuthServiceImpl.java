package com.bookflow.auth.service.impl;

import com.bookflow.auth.dto.request.LoginRequest;
import com.bookflow.auth.dto.request.RegisterRequest;
import com.bookflow.auth.dto.response.AuthResponse;
import com.bookflow.auth.dto.response.UserResponse;
import com.bookflow.auth.entity.User;
import com.bookflow.auth.entity.UserStatus;
import com.bookflow.auth.repository.UserRepository;
import com.bookflow.auth.security.JwtTokenProvider;
import com.bookflow.auth.service.AuthService;
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

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
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

        Company company = companyRepository
            .findById(request.getCompanyId())
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró la empresa con id: "
                        + request.getCompanyId()
                )
            );

        User user = User.builder()
            .company(company)
            .email(request.getEmail())
            .password(
                passwordEncoder.encode(
                    request.getPassword()
                )
            )
            .fullName(request.getFullName())
            .role(request.getRole())
            .status(UserStatus.ACTIVE)
            .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(
            user.getEmail()
        );

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .companyId(company.getId())
            .companyName(company.getBusinessName())
            .build();
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

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .companyId(user.getCompany().getId())
            .companyName(
                user.getCompany().getBusinessName()
            )
            .build();
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

        return userRepository.findAll().stream()
            .filter(u ->
                u.getCompany().getId().equals(companyId)
            )
            .map(this::toResponse)
            .toList();
    }

    private UserResponse toResponse(User user) {

        return UserResponse.builder()
            .id(user.getId())
            .companyId(user.getCompany().getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .status(user.getStatus())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
