package com.bookflow.promotion.repository;

import com.bookflow.promotion.entity.Promotion;
import com.bookflow.promotion.entity.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PromotionRepository
    extends JpaRepository<Promotion, Long> {

    List<Promotion> findAllByCompanyId(Long companyId);

    List<Promotion> findAllByCompanyIdAndStatus(
        Long companyId,
        PromotionStatus status
    );

    Optional<Promotion> findByCompanyIdAndCode(
        Long companyId,
        String code
    );

    Optional<Promotion> findByIdAndCompanyId(
        Long id,
        Long companyId
    );
}
