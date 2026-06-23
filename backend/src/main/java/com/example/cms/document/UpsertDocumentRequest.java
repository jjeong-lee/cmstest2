package com.example.cms.document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpsertDocumentRequest(
        @NotNull(message = "폴더를 선택해 주세요.")
        Long folderId,
        @NotBlank(message = "문서 제목을 입력해 주세요.")
        @Size(max = 200, message = "문서 제목은 200자 이하여야 합니다.")
        String title,
        @NotBlank(message = "문서 본문을 입력해 주세요.")
        String markdownBody,
        DocumentStatus status
) {
}
