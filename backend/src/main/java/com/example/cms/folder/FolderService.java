package com.example.cms.folder;

import com.example.cms.common.error.ConflictException;
import com.example.cms.common.error.NotFoundException;
import com.example.cms.document.DocumentRepository;
import com.example.cms.document.DocumentStatus;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FolderService {
    private final FolderRepository folderRepository;
    private final DocumentRepository documentRepository;

    public FolderService(FolderRepository folderRepository, DocumentRepository documentRepository) {
        this.folderRepository = folderRepository;
        this.documentRepository = documentRepository;
    }

    public FolderDto create(CreateFolderRequest request) {
        FolderEntity parent = request.parentId() == null ? null : folderRepository.findByIdAndDeletedAtIsNull(request.parentId())
                .orElseThrow(() -> new NotFoundException("상위 폴더를 찾을 수 없습니다."));

        FolderEntity entity = new FolderEntity();
        entity.setName(request.name().trim());
        entity.setParent(parent);
        entity.setPath(parent == null ? "/" + request.name().trim() : parent.getPath() + "/" + request.name().trim());
        entity.setStatus(FolderStatus.ACTIVE);
        FolderEntity saved = folderRepository.save(entity);
        return FolderDto.of(saved, 0);
    }

    @Transactional(readOnly = true)
    public List<FolderDto> getAdminTree() {
        return buildTree(folderRepository.findByDeletedAtIsNullOrderByPathAsc(), false);
    }

    @Transactional(readOnly = true)
    public List<FolderDto> getPublicTree() {
        return buildTree(folderRepository.findByDeletedAtIsNullAndStatusOrderByPathAsc(FolderStatus.ACTIVE), true);
    }

    public void delete(Long id) {
        FolderEntity folder = folderRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("폴더를 찾을 수 없습니다."));

        boolean hasChildren = folderRepository.existsByParentIdAndDeletedAtIsNull(id);
        boolean hasDocuments = documentRepository.countByFolderIdAndDeletedAtIsNullAndStatusNot(id, DocumentStatus.DELETED) > 0;
        if (hasChildren || hasDocuments) {
            throw new ConflictException("하위 폴더 또는 문서가 있어 삭제할 수 없습니다.");
        }

        folder.setStatus(FolderStatus.DELETED);
        folder.setDeletedBy("system");
        folder.setDeletedAt(OffsetDateTime.now());
        folderRepository.save(folder);
    }

    public FolderEntity getActiveFolder(Long id) {
        FolderEntity folder = folderRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("폴더를 찾을 수 없습니다."));
        if (folder.getStatus() == FolderStatus.DELETED) {
            throw new NotFoundException("폴더를 찾을 수 없습니다.");
        }
        return folder;
    }

    private List<FolderDto> buildTree(List<FolderEntity> folders, boolean publicOnly) {
        Map<Long, FolderDto> dtoMap = new LinkedHashMap<>();
        for (FolderEntity folder : folders) {
            long documentCount = publicOnly
                    ? documentRepository.countByFolderIdAndDeletedAtIsNullAndStatus(folder.getId(), DocumentStatus.PUBLISHED)
                    : documentRepository.countByFolderIdAndDeletedAtIsNullAndStatusNot(folder.getId(), DocumentStatus.DELETED);
            dtoMap.put(folder.getId(), FolderDto.of(folder, documentCount));
        }

        List<FolderDto> roots = new ArrayList<>();
        Map<Long, List<FolderDto>> children = new HashMap<>();
        for (FolderEntity folder : folders) {
            children.put(folder.getId(), new ArrayList<>());
        }
        for (FolderEntity folder : folders) {
            FolderDto dto = dtoMap.get(folder.getId());
            if (folder.getParent() == null || !dtoMap.containsKey(folder.getParent().getId())) {
                roots.add(dto);
            } else {
                children.get(folder.getParent().getId()).add(dto);
            }
        }
        return roots.stream().map(root -> attachChildren(root, children)).toList();
    }

    private FolderDto attachChildren(FolderDto dto, Map<Long, List<FolderDto>> children) {
        List<FolderDto> nested = children.getOrDefault(dto.id(), List.of()).stream()
                .map(child -> attachChildren(child, children))
                .toList();
        return dto.withChildren(nested);
    }
}
