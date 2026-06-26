package com.example.cms.user;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<TeamEntity, Long> {
    List<TeamEntity> findAllByOrderByNameAsc();
}
