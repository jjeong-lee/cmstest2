package com.example.cms.document;

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

@WebMvcTest(DocumentController.class)
class DocumentControllerValidationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DocumentService documentService;

    @Test
    void createsDocument() throws Exception {
        when(documentService.create(any())).thenReturn(new DocumentDetailDto(
                1L, "제목", "본문", "DRAFT", 1L, "가이드", "/가이드", OffsetDateTime.now(), OffsetDateTime.now()));

        UpsertDocumentRequest request = new UpsertDocumentRequest(1L, "제목", "본문", DocumentStatus.DRAFT);

        mockMvc.perform(post("/api/admin/documents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("제목"));
    }

    @Test
    void rejectsBlankTitle() throws Exception {
        UpsertDocumentRequest request = new UpsertDocumentRequest(1L, " ", "본문", DocumentStatus.DRAFT);

        mockMvc.perform(post("/api/admin/documents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }
}
