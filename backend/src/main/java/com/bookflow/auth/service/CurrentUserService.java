package com.bookflow.auth.service;

import com.bookflow.auth.entity.User;
import com.bookflow.auth.repository.UserRepository;
import com.bookflow.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("No hay usuario autenticado.");
        }

        String email = authentication.getName();

        return userRepository.findByEmailWithRole(email)
            .orElseThrow(() ->
                new ResourceNotFoundException(
                    "No se encontró el usuario con email: " + email
                )
            );
    }

    @Transactional(readOnly = true)
    public Long getCurrentCompanyId() {
        return getCurrentUser().getCompany().getId();
    }

    @Transactional(readOnly = true)
    public boolean hasMinimumLevel(int requiredLevel) {
        return getCurrentUser().getRole().getLevel() >= requiredLevel;
    }
}
