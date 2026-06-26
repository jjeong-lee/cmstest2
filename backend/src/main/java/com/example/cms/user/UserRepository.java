package com.example.cms.user;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    List<UserEntity> findAllByOrderByNameAsc();

    List<UserEntity> findByTeamIdOrderByNameAsc(Long teamId);

    Optional<UserEntity> findById(Long id);

    long countByTeamId(Long teamId);
}
