package com.example.cms.document;

import jakarta.validation.constraints.NotNull;

public record UpdateDocumentStatusRequest(
        @NotNull(message = "상태를 선택해 주세요.")
        DocumentStatus status
) {
}
