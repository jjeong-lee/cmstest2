package com.example.cms.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpsertUserRequest(
        @NotNull(message = "역할을 선택해 주세요.")
        UserRole role,
        @NotBlank(message = "이름을 입력해 주세요.")
        @Size(max = 120, message = "이름은 120자 이하여야 합니다.")
        String name,
        @NotBlank(message = "이메일을 입력해 주세요.")
        @Email(message = "유효한 이메일을 입력해 주세요.")
        @Size(max = 160, message = "이메일은 160자 이하여야 합니다.")
        String email,
        Long teamId
) {
}
