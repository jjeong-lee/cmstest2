package com.example.cms.user;

import jakarta.validation.constraints.NotNull;

public record CreateAccessLogRequest(
        @NotNull(message = "사용자 ID를 선택해 주세요.")
        Long userId
) {
}
