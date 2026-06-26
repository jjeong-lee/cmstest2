package com.example.cms.user;

import com.example.cms.common.error.ConflictException;
import com.example.cms.common.error.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserAdminService {
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    public UserAdminService(UserRepository userRepository, TeamRepository teamRepository) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getUsers(Long teamId) {
        List<UserEntity> users = teamId == null
                ? userRepository.findAllByOrderByNameAsc()
                : userRepository.findByTeamIdOrderByNameAsc(teamId);
        return users.stream().map(this::toUserDto).toList();
    }

    @Transactional(readOnly = true)
    public List<TeamDto> getTeams() {
        return teamRepository.findAllByOrderByNameAsc().stream()
                .map(team -> new TeamDto(team.getId(), team.getName(), userRepository.countByTeamId(team.getId())))
                .toList();
    }

    public AdminUserDto createUser(UpsertUserRequest request) {
        UserEntity entity = new UserEntity();
        apply(entity, request);
        return toUserDto(userRepository.save(entity));
    }

    public AdminUserDto updateUser(Long id, UpsertUserRequest request) {
        UserEntity entity = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        apply(entity, request);
        return toUserDto(userRepository.save(entity));
    }

    public void deleteUser(Long id) {
        UserEntity entity = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        userRepository.delete(entity);
    }

    public TeamDto createTeam(CreateTeamRequest request) {
        TeamEntity entity = new TeamEntity();
        entity.setName(request.name().trim());
        TeamEntity saved = teamRepository.save(entity);
        return new TeamDto(saved.getId(), saved.getName(), 0);
    }

    public void deleteTeam(Long id) {
        TeamEntity team = teamRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("팀을 찾을 수 없습니다."));
        long memberCount = userRepository.countByTeamId(id);
        if (memberCount > 0) {
            throw new ConflictException("소속 사용자가 있는 팀은 삭제할 수 없습니다.");
        }
        teamRepository.delete(team);
    }

    private void apply(UserEntity entity, UpsertUserRequest request) {
        entity.setRole(request.role());
        entity.setName(request.name().trim());
        entity.setEmail(request.email().trim().toLowerCase());
        entity.setTeam(resolveTeam(request.teamId()));
    }

    private TeamEntity resolveTeam(Long teamId) {
        if (teamId == null) {
            return null;
        }
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new NotFoundException("팀을 찾을 수 없습니다."));
    }

    private AdminUserDto toUserDto(UserEntity entity) {
        TeamEntity team = entity.getTeam();
        return new AdminUserDto(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getRole().name(),
                team == null ? null : team.getId(),
                team == null ? null : team.getName(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
