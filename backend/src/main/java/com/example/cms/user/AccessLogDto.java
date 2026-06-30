package com.example.cms.user;

import java.time.OffsetDateTime;

public record AccessLogDto(
        Long id,
        Long userId,
        String userName,
        String role,
        OffsetDateTime accessedAt
) {
}
