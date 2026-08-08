package com.bookflow.client.mapper;

import com.bookflow.client.dto.request.CreateClientRequest;
import com.bookflow.client.dto.request.UpdateClientRequest;
import com.bookflow.client.dto.response.ClientResponse;
import com.bookflow.client.entity.Client;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ClientMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "status", constant = "ACTIVE")
    Client toEntity(CreateClientRequest request);

    @Mapping(target = "companyId", source = "company.id")
    ClientResponse toResponse(Client client);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "company", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateEntity(UpdateClientRequest request, @MappingTarget Client client);
}
