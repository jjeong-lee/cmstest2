package com.example.cms.folder;

import java.util.ArrayList;
import java.util.List;

public record FolderDto(
        Long id,
        String name,
        Long parentId,
        String path,
        String status,
        long documentCount,
        List<FolderDto> children
) {
    public FolderDto withChildren(List<FolderDto> children) {
        return new FolderDto(id, name, parentId, path, status, documentCount, children);
    }

    public static FolderDto of(FolderEntity entity, long documentCount) {
        return new FolderDto(
                entity.getId(),
                entity.getName(),
                entity.getParent() == null ? null : entity.getParent().getId(),
                entity.getPath(),
                entity.getStatus().name(),
                documentCount,
                new ArrayList<>()
        );
    }
}
