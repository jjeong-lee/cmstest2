package com.example.cms.user;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserAdminController.class)
class UserAdminControllerValidationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserAdminService userAdminService;

    @Test
    void createsUser() throws Exception {
        when(userAdminService.createUser(any())).thenReturn(new AdminUserDto(
                1L,
                "관리자",
                "admin@example.com",
                "ADMIN",
                10L,
                "Platform",
                OffsetDateTime.now(),
                OffsetDateTime.now()));

        UpsertUserRequest request = new UpsertUserRequest(UserRole.ADMIN, "관리자", "admin@example.com", 10L);

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("admin@example.com"));
    }

    @Test
    void rejectsInvalidEmail() throws Exception {
        UpsertUserRequest request = new UpsertUserRequest(UserRole.EDITOR, "운영자", "wrong-email", null);

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }
}
