package com.example.cms.document;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DocumentController {
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/admin/documents")
    public List<DocumentSummaryDto> getAdminDocuments(@RequestParam(required = false) Long folderId) {
        return documentService.getAdminDocuments(folderId);
    }

    @GetMapping("/public/documents")
    public List<DocumentSummaryDto> getPublicDocuments(@RequestParam(required = false) Long folderId) {
        return documentService.getPublicDocuments(folderId);
    }

    @GetMapping("/admin/documents/{id}")
    public DocumentDetailDto getAdminDocument(@PathVariable Long id) {
        return documentService.getAdminDetail(id);
    }

    @GetMapping("/public/documents/{id}")
    public DocumentDetailDto getPublicDocument(@PathVariable Long id) {
        return documentService.getPublicDetail(id);
    }

    @GetMapping("/public/search")
    public List<SearchResultDto> search(@RequestParam(required = false) String q) {
        return documentService.searchPublished(q);
    }

    @PostMapping("/admin/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentDetailDto create(@Valid @RequestBody UpsertDocumentRequest request) {
        return documentService.create(request);
    }

    @PutMapping("/admin/documents/{id}")
    public DocumentDetailDto update(@PathVariable Long id, @Valid @RequestBody UpsertDocumentRequest request) {
        return documentService.update(id, request);
    }

    @PostMapping("/admin/documents/{id}/status")
    public DocumentDetailDto updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateDocumentStatusRequest request) {
        return documentService.updateStatus(id, request);
    }

    @DeleteMapping("/admin/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        documentService.delete(id);
    }
}
