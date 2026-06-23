package com.example.cms.folder;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FolderRepository extends JpaRepository<FolderEntity, Long> {
    List<FolderEntity> findByDeletedAtIsNullOrderByPathAsc();
    List<FolderEntity> findByDeletedAtIsNullAndStatusOrderByPathAsc(FolderStatus status);
    Optional<FolderEntity> findByIdAndDeletedAtIsNull(Long id);
    boolean existsByParentIdAndDeletedAtIsNull(Long parentId);
}
