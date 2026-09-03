package com.bookflow.common.audit;

import com.bookflow.auth.entity.User;
import com.bookflow.auth.service.CurrentUserService;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Component
@RequiredArgsConstructor
public class AuditListener {

    private final CurrentUserService currentUserService;

    @PrePersist
    public void prePersist(BaseEntity entity) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            entity.setCreatedBy(user.getId());
            entity.setUpdatedBy(user.getId());
        }
    }

    @PreUpdate
    public void preUpdate(BaseEntity entity) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            entity.setUpdatedBy(user.getId());
        }
    }
}
