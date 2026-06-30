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
class AccessLogControllerValidationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserAdminService userAdminService;

    @Test
    void createsAccessLog() throws Exception {
        when(userAdminService.createAccessLog(any())).thenReturn(new AccessLogDto(
                11L,
                7L,
                "홍길동",
                "ADMIN",
                OffsetDateTime.parse("2026-06-30T01:00:00Z")));

        CreateAccessLogRequest request = new CreateAccessLogRequest(7L);

        mockMvc.perform(post("/api/admin/access-logs/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(7L))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void rejectsMissingUserId() throws Exception {
        mockMvc.perform(post("/api/admin/access-logs/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }
}
