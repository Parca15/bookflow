package com.bookflow.promotion.service.impl;

import com.bookflow.catalog.entity.Catalog;
import com.bookflow.catalog.repository.CatalogRepository;
import com.bookflow.common.exception.ResourceAlreadyExistsException;
import com.bookflow.common.exception.ResourceNotFoundException;
import com.bookflow.company.entity.Company;
import com.bookflow.company.repository.CompanyRepository;
import com.bookflow.promotion.dto.request.CreatePromotionRequest;
import com.bookflow.promotion.dto.request.UpdatePromotionRequest;
import com.bookflow.promotion.dto.response.PromotionResponse;
import com.bookflow.promotion.entity.Promotion;
import com.bookflow.promotion.entity.PromotionStatus;
import com.bookflow.promotion.mapper.PromotionMapper;
import com.bookflow.promotion.repository.PromotionRepository;
import com.bookflow.promotion.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final CompanyRepository companyRepository;
    private final CatalogRepository catalogRepository;
    private final PromotionMapper promotionMapper;

    @Override
    public PromotionResponse create(Long companyId, CreatePromotionRequest request) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("No se encontró la empresa con id: " + companyId));

        if (request.getCode() != null
            && promotionRepository.findByCompanyIdAndCode(companyId, request.getCode()).isPresent()) {
            throw new ResourceAlreadyExistsException("Ya existe una promoción con ese código.");
        }

        Promotion promotion = new Promotion();
        promotion.setCompany(company);
        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setType(request.getType());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setCode(request.getCode());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setMinPurchase(request.getMinPurchase());
        promotion.setMaxUses(request.getMaxUses());
        promotion.setUsedCount(0);
        promotion.setStatus(PromotionStatus.ACTIVE);

        if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
            Set<Catalog> services = new HashSet<>();
            for (Long serviceId : request.getServiceIds()) {
                Catalog catalog = catalogRepository.findById(serviceId)
                    .orElseThrow(() -> new ResourceNotFoundException("No se encontró el servicio con id: " + serviceId));
                if (!catalog.getCompany().getId().equals(companyId)) {
                    throw new IllegalArgumentException("El servicio no pertenece a la empresa.");
                }
                services.add(catalog);
            }
            promotion.setServices(services);
        }

        promotion = promotionRepository.save(promotion);
        return promotionMapper.toResponse(promotion);
    }

    @Override
    public PromotionResponse update(Long companyId, Long promotionId, UpdatePromotionRequest request) {
        Promotion promotion = findPromotion(companyId, promotionId);

        if (request.getName() != null) promotion.setName(request.getName());
        if (request.getDescription() != null) promotion.setDescription(request.getDescription());
        if (request.getType() != null) promotion.setType(request.getType());
        if (request.getDiscountType() != null) promotion.setDiscountType(request.getDiscountType());
        if (request.getDiscountValue() != null) promotion.setDiscountValue(request.getDiscountValue());

        if (request.getCode() != null) {
            if (!request.getCode().equals(promotion.getCode())
                && promotionRepository.findByCompanyIdAndCode(companyId, request.getCode()).isPresent()) {
                throw new ResourceAlreadyExistsException("Ya existe una promoción con ese código.");
            }
            promotion.setCode(request.getCode());
        }

        if (request.getStartDate() != null) promotion.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) promotion.setEndDate(request.getEndDate());
        if (request.getMinPurchase() != null) promotion.setMinPurchase(request.getMinPurchase());
        if (request.getMaxUses() != null) promotion.setMaxUses(request.getMaxUses());
        if (request.getStatus() != null) promotion.setStatus(request.getStatus());

        if (request.getServiceIds() != null) {
            Set<Catalog> services = new HashSet<>();
            for (Long serviceId : request.getServiceIds()) {
                Catalog catalog = catalogRepository.findById(serviceId)
                    .orElseThrow(() -> new ResourceNotFoundException("No se encontró el servicio con id: " + serviceId));
                if (!catalog.getCompany().getId().equals(companyId)) {
                    throw new IllegalArgumentException("El servicio no pertenece a la empresa.");
                }
                services.add(catalog);
            }
            promotion.setServices(services);
        }

        promotion = promotionRepository.save(promotion);
        return promotionMapper.toResponse(promotion);
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse findById(Long companyId, Long promotionId) {
        return promotionMapper.toResponse(findPromotion(companyId, promotionId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> findAllByCompany(Long companyId) {
        companyRepository.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("No se encontró la empresa con id: " + companyId));
        return promotionRepository.findAllByCompanyId(companyId)
            .stream().map(promotionMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> findActiveByCompany(Long companyId) {
        companyRepository.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("No se encontró la empresa con id: " + companyId));
        return promotionRepository.findAllByCompanyIdAndStatus(companyId, PromotionStatus.ACTIVE)
            .stream().map(promotionMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse findByCode(Long companyId, String code) {
        return promotionMapper.toResponse(promotionRepository.findByCompanyIdAndCode(companyId, code)
            .orElseThrow(() -> new ResourceNotFoundException("No se encontró una promoción con el código: " + code)));
    }

    @Override
    public void deactivate(Long companyId, Long promotionId) {
        Promotion promotion = findPromotion(companyId, promotionId);
        promotion.setStatus(PromotionStatus.INACTIVE);
        promotionRepository.save(promotion);
    }

    private Promotion findPromotion(Long companyId, Long promotionId) {
        return promotionRepository.findByIdAndCompanyId(promotionId, companyId)
            .orElseThrow(() -> new ResourceNotFoundException("No se encontró la promoción con id: " + promotionId));
    }
}
