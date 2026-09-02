package com.bookflow.auth.service;

import com.bookflow.auth.entity.User;
import com.bookflow.auth.entity.UserStatus;
import com.bookflow.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl
    implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email)
        throws UsernameNotFoundException {

        User user = userRepository.findByEmailWithRole(email)
            .orElseThrow(() ->
                new UsernameNotFoundException(
                    "Usuario no encontrado con email: "
                        + email
                )
            );

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UsernameNotFoundException(
                "Usuario inactivo: " + email
            );
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // Agregar el rol como autoridad
        authorities.add(new SimpleGrantedAuthority(
            "ROLE_" + user.getRole().getName()
        ));

        // Agregar permisos del módulo como autoridades
        if (user.getRole().getPermissions() != null) {
            for (var module : user.getRole().getPermissions()) {
                authorities.add(new SimpleGrantedAuthority(
                    "permission:" + module.name()
                ));
            }
        }

        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            authorities
        );
    }
}
