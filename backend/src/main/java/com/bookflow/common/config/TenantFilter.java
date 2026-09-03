package com.bookflow.common.config;

import com.bookflow.auth.entity.User;
import com.bookflow.auth.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class TenantFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    private static final Pattern COMPANY_ID_PATTERN =
        Pattern.compile("/api/v1/companies/(\\d+)");

    private static final Pattern APPOINTMENT_COMPANY_PATTERN =
        Pattern.compile("/api/v1/appointments/company/(\\d+)");

    private static final String[] TENANT_EXEMPT_PATHS = {
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/companies",
        "/v3/api-docs",
        "/swagger-ui",
        "/swagger-ui.html"
    };

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        for (String exempt : TENANT_EXEMPT_PATHS) {
            if (path.startsWith(exempt)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        String email = authentication.getName();

        User user = userRepository.findByEmailWithRole(email)
            .orElse(null);

        if (user == null) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Usuario no encontrado\"}"
            );
            return;
        }

        Long userCompanyId = user.getCompany().getId();

        if (userCompanyId == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Long requestCompanyId = extractCompanyIdFromPath(path);

        if (requestCompanyId != null && !requestCompanyId.equals(userCompanyId)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"No tienes acceso a los recursos de esta empresa\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Long extractCompanyIdFromPath(String path) {
        Matcher matcher = COMPANY_ID_PATTERN.matcher(path);
        if (matcher.find()) {
            return Long.parseLong(matcher.group(1));
        }

        matcher = APPOINTMENT_COMPANY_PATTERN.matcher(path);
        if (matcher.find()) {
            return Long.parseLong(matcher.group(1));
        }

        return null;
    }
}
