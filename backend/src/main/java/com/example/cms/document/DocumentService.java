package com.example.cms.document;

import com.example.cms.common.error.BadRequestException;
import com.example.cms.common.error.NotFoundException;
import com.example.cms.folder.FolderEntity;
import com.example.cms.folder.FolderService;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final FolderService folderService;

    public DocumentService(DocumentRepository documentRepository, FolderService folderService) {
        this.documentRepository = documentRepository;
        this.folderService = folderService;
    }

    public DocumentDetailDto create(UpsertDocumentRequest request) {
        FolderEntity folder = folderService.getActiveFolder(request.folderId());
        DocumentEntity entity = new DocumentEntity();
        entity.setFolder(folder);
        entity.setTitle(request.title().trim());
        entity.setMarkdownBody(request.markdownBody());
        entity.setStatus(request.status() == null ? DocumentStatus.DRAFT : request.status());
        return toDetail(documentRepository.save(entity));
    }

    public DocumentDetailDto update(Long id, UpsertDocumentRequest request) {
        DocumentEntity entity = documentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("문서를 찾을 수 없습니다."));
        FolderEntity folder = folderService.getActiveFolder(request.folderId());
        entity.setFolder(folder);
        entity.setTitle(request.title().trim());
        entity.setMarkdownBody(request.markdownBody());
        if (request.status() != null && request.status() != DocumentStatus.DELETED) {
            entity.setStatus(request.status());
        }
        return toDetail(documentRepository.save(entity));
    }

    public DocumentDetailDto updateStatus(Long id, UpdateDocumentStatusRequest request) {
        DocumentEntity entity = documentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("문서를 찾을 수 없습니다."));
        if (request.status() == DocumentStatus.DELETED) {
            throw new BadRequestException("상태 변경으로 삭제할 수 없습니다. 삭제 API를 사용해 주세요.");
        }
        entity.setStatus(request.status());
        return toDetail(documentRepository.save(entity));
    }

    public void delete(Long id) {
        DocumentEntity entity = documentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("문서를 찾을 수 없습니다."));
        entity.setStatus(DocumentStatus.DELETED);
        entity.setDeletedBy("system");
        entity.setDeletedAt(OffsetDateTime.now());
        documentRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<DocumentSummaryDto> getAdminDocuments(Long folderId) {
        List<DocumentEntity> documents = folderId == null
                ? documentRepository.findByDeletedAtIsNullAndStatusNotOrderByUpdatedAtDesc(DocumentStatus.DELETED)
                : documentRepository.findByFolderIdAndDeletedAtIsNullAndStatusNotOrderByUpdatedAtDesc(folderId, DocumentStatus.DELETED);
        return documents.stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentSummaryDto> getPublicDocuments(Long folderId) {
        return documentRepository.findPublished(folderId).stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public DocumentDetailDto getAdminDetail(Long id) {
        return toDetail(documentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("문서를 찾을 수 없습니다.")));
    }

    @Transactional(readOnly = true)
    public DocumentDetailDto getPublicDetail(Long id) {
        DocumentEntity entity = documentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("문서를 찾을 수 없습니다."));
        if (entity.getStatus() != DocumentStatus.PUBLISHED) {
            throw new NotFoundException("문서를 찾을 수 없습니다.");
        }
        return toDetail(entity);
    }

    @Transactional(readOnly = true)
    public List<SearchResultDto> searchPublished(String query) {
        if (query == null || query.trim().isBlank()) {
            return List.of();
        }
        String normalized = query.trim();
        return documentRepository.searchPublished(normalized).stream()
                .map(document -> new SearchResultDto(
                        document.getId(),
                        document.getTitle(),
                        buildSnippet(document.getMarkdownBody(), normalized),
                        document.getFolder().getPath(),
                        document.getUpdatedAt()))
                .toList();
    }

    private String buildSnippet(String markdown, String query) {
        String plain = markdown.replaceAll("[#>*`-]", " ").replaceAll("\\s+", " ").trim();
        if (plain.isBlank()) {
            return "본문 미리보기가 없습니다.";
        }
        String lower = plain.toLowerCase();
        String q = query.toLowerCase();
        int index = lower.indexOf(q);
        if (index < 0) {
            return plain.length() > 160 ? plain.substring(0, 160) + "..." : plain;
        }
        int start = Math.max(0, index - 50);
        int end = Math.min(plain.length(), index + query.length() + 80);
        String snippet = plain.substring(start, end).trim();
        if (start > 0) {
            snippet = "..." + snippet;
        }
        if (end < plain.length()) {
            snippet = snippet + "...";
        }
        return snippet;
    }

    private DocumentSummaryDto toSummary(DocumentEntity entity) {
        return new DocumentSummaryDto(
                entity.getId(),
                entity.getTitle(),
                entity.getStatus().name(),
                entity.getFolder().getId(),
                entity.getFolder().getName(),
                entity.getUpdatedAt(),
                buildSnippet(entity.getMarkdownBody(), entity.getTitle())
        );
    }

    private DocumentDetailDto toDetail(DocumentEntity entity) {
        return new DocumentDetailDto(
                entity.getId(),
                entity.getTitle(),
                entity.getMarkdownBody(),
                entity.getStatus().name(),
                entity.getFolder().getId(),
                entity.getFolder().getName(),
                entity.getFolder().getPath(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
