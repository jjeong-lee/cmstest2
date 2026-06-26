package com.example.cms.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTeamRequest(
        @NotBlank(message = "팀 이름을 입력해 주세요.")
        @Size(max = 120, message = "팀 이름은 120자 이하여야 합니다.")
        String name
) {
}
