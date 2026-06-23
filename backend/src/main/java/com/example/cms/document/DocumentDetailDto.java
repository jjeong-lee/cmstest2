package com.example.cms.document;

import java.time.OffsetDateTime;

public record DocumentDetailDto(
        Long id,
        String title,
        String markdownBody,
        String status,
        Long folderId,
        String folderName,
        String folderPath,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
