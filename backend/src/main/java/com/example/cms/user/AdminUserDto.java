package com.example.cms.user;

import java.time.OffsetDateTime;

public record AdminUserDto(
        Long id,
        String name,
        String email,
        String role,
        Long teamId,
        String teamName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
