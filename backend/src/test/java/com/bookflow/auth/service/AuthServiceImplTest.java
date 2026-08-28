package com.bookflow.auth.service;

import com.bookflow.auth.dto.request.LoginRequest;
import com.bookflow.auth.dto.request.RegisterRequest;
import com.bookflow.auth.entity.User;
import com.bookflow.auth.entity.UserRole;
import com.bookflow.auth.entity.UserStatus;
import com.bookflow.auth.repository.UserRepository;
import com.bookflow.auth.security.JwtTokenProvider;
import com.bookflow.auth.service.impl.AuthServiceImpl;
import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.entity.CompanyStatus;
import com.bookflow.company.repository.CompanyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private Company company;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);
        company.setBusinessName("Test Company");
        company.setStatus(CompanyStatus.ACTIVE);
    }

    @Test
    void register_success() {
        when(companyRepository.findById(1L))
            .thenReturn(Optional.of(company));
        when(userRepository.existsByCompanyIdAndEmail(
            eq(1L), eq("admin@test.com")))
            .thenReturn(false);
        when(passwordEncoder.encode("123456"))
            .thenReturn("$2a$encoded");
        when(userRepository.save(any(User.class)))
            .thenAnswer(invocation -> {
                User u = invocation.getArgument(0);
                u.setId(1L);
                return u;
            });
        when(jwtTokenProvider.generateToken(
            eq("admin@test.com")))
            .thenReturn("mock-token");

        RegisterRequest request =
            new RegisterRequest();
        request.setCompanyId(1L);
        request.setEmail("admin@test.com");
        request.setPassword("123456");
        request.setFullName("Admin Test");
        request.setRole(UserRole.ADMIN);

        var response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-token", response.getToken());
        assertEquals("Bearer",
            response.getTokenType());
        assertEquals("admin@test.com",
            response.getEmail());
        assertEquals(UserRole.ADMIN, response.getRole());
        assertEquals(1L, response.getCompanyId());
        assertEquals("Test Company",
            response.getCompanyName());
    }

    @Test
    void register_duplicate_email() {
        when(userRepository.existsByCompanyIdAndEmail(
            eq(1L), eq("admin@test.com")))
            .thenReturn(true);

        RegisterRequest request =
            new RegisterRequest();
        request.setCompanyId(1L);
        request.setEmail("admin@test.com");
        request.setPassword("123456");
        request.setFullName("Admin Test");
        request.setRole(UserRole.ADMIN);

        assertThrows(
            ResourceAlreadyExistsException.class,
            () -> authService.register(request)
        );
    }

    @Test
    void register_company_not_found() {
        when(companyRepository.findById(99L))
            .thenReturn(Optional.empty());

        RegisterRequest request =
            new RegisterRequest();
        request.setCompanyId(99L);
        request.setEmail("admin@test.com");
        request.setPassword("123456");
        request.setFullName("Admin Test");
        request.setRole(UserRole.ADMIN);

        assertThrows(ResourceNotFoundException.class,
            () -> authService.register(request));
    }

    @Test
    void login_success() {
        Authentication auth =
            mock(Authentication.class);

        when(authenticationManager.authenticate(
            any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(auth);
        when(jwtTokenProvider.generateToken(auth))
            .thenReturn("mock-token");

        User user = new User();
        user.setId(1L);
        user.setEmail("admin@test.com");
        user.setFullName("Admin Test");
        user.setRole(UserRole.ADMIN);
        user.setCompany(company);

        when(userRepository.findByEmail("admin@test.com"))
            .thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setEmail("admin@test.com");
        request.setPassword("123456");

        var response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-token", response.getToken());
        assertEquals("admin@test.com",
            response.getEmail());
        assertEquals("Admin Test",
            response.getFullName());
    }

    @Test
    void login_user_not_found() {
        Authentication auth =
            mock(Authentication.class);

        when(authenticationManager.authenticate(
            any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(auth);
        when(jwtTokenProvider.generateToken(auth))
            .thenReturn("mock-token");
        when(userRepository.findByEmail("unknown@test.com"))
            .thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@test.com");
        request.setPassword("123456");

        assertThrows(ResourceNotFoundException.class,
            () -> authService.login(request));
    }
}
