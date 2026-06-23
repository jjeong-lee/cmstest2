package com.example.cms.document;

import java.time.OffsetDateTime;

public record DocumentSummaryDto(
        Long id,
        String title,
        String status,
        Long folderId,
        String folderName,
        OffsetDateTime updatedAt,
        String summary
) {
}
