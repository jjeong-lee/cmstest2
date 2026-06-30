package com.example.cms.user;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccessLogRepository extends JpaRepository<AccessLogEntity, Long> {
    List<AccessLogEntity> findAllByOrderByAccessedAtDescIdDesc();

    long countByUserId(Long userId);
}
