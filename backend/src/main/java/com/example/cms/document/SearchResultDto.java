package com.example.cms.document;

import java.time.OffsetDateTime;

public record SearchResultDto(
        Long id,
        String title,
        String snippet,
        String folderPath,
        OffsetDateTime updatedAt
) {
}
