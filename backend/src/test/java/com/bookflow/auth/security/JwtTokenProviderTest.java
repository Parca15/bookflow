package com.bookflow.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(
            jwtTokenProvider,
            "jwtSecret",
            "Ym9va2Zsb3dTZWNyZXRLZXlGb3JKd3RUb2tlbjIwMjQh"
        );
        ReflectionTestUtils.setField(
            jwtTokenProvider,
            "jwtExpiration",
            86400000L
        );
    }

    @Test
    void generateToken_and_getEmail() {
        String email = "test@bookflow.com";
        String token = jwtTokenProvider.generateToken(email);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        String recoveredEmail =
            jwtTokenProvider.getEmailFromToken(token);

        assertEquals(email, recoveredEmail);
    }

    @Test
    void validateToken_valid() {
        String token =
            jwtTokenProvider.generateToken("test@bookflow.com");

        assertTrue(
            jwtTokenProvider.validateToken(token)
        );
    }

    @Test
    void validateToken_invalid() {
        assertFalse(
            jwtTokenProvider.validateToken(
                "invalid.token.here"
            )
        );
    }

    @Test
    void validateToken_expired() {
        ReflectionTestUtils.setField(
            jwtTokenProvider,
            "jwtExpiration",
            -1L
        );

        String token =
            jwtTokenProvider.generateToken("test@bookflow.com");

        assertFalse(
            jwtTokenProvider.validateToken(token)
        );
    }

    @Test
    void getEmailFromToken_differentToken() {
        String token1 =
            jwtTokenProvider.generateToken("user1@test.com");
        String token2 =
            jwtTokenProvider.generateToken("user2@test.com");

        assertEquals("user1@test.com",
            jwtTokenProvider.getEmailFromToken(token1));
        assertEquals("user2@test.com",
            jwtTokenProvider.getEmailFromToken(token2));
    }
}
