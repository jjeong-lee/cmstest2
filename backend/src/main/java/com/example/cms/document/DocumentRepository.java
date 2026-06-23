package com.example.cms.document;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {
    Optional<DocumentEntity> findByIdAndDeletedAtIsNull(Long id);

    List<DocumentEntity> findByDeletedAtIsNullAndStatusNotOrderByUpdatedAtDesc(DocumentStatus status);

    List<DocumentEntity> findByFolderIdAndDeletedAtIsNullAndStatusNotOrderByUpdatedAtDesc(Long folderId, DocumentStatus status);

    long countByFolderIdAndDeletedAtIsNullAndStatusNot(Long folderId, DocumentStatus status);

    long countByFolderIdAndDeletedAtIsNullAndStatus(Long folderId, DocumentStatus status);

    @Query("""
            select d from DocumentEntity d
            where d.deletedAt is null
              and d.status = com.example.cms.document.DocumentStatus.PUBLISHED
              and (:folderId is null or d.folder.id = :folderId)
            order by d.updatedAt desc
            """)
    List<DocumentEntity> findPublished(@Param("folderId") Long folderId);

    @Query("""
            select d from DocumentEntity d
            where d.deletedAt is null
              and d.status = com.example.cms.document.DocumentStatus.PUBLISHED
              and (
                lower(d.title) like lower(concat('%', :query, '%'))
                or lower(d.markdownBody) like lower(concat('%', :query, '%'))
              )
            order by d.updatedAt desc
            """)
    List<DocumentEntity> searchPublished(@Param("query") String query);
}
