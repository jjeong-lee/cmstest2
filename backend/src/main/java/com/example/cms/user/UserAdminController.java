package com.example.cms.user;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class UserAdminController {
    private final UserAdminService userAdminService;

    public UserAdminController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @GetMapping("/users")
    public List<AdminUserDto> getUsers(@RequestParam(required = false) Long teamId) {
        return userAdminService.getUsers(teamId);
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminUserDto createUser(@Valid @RequestBody UpsertUserRequest request) {
        return userAdminService.createUser(request);
    }

    @PutMapping("/users/{id}")
    public AdminUserDto updateUser(@PathVariable Long id, @Valid @RequestBody UpsertUserRequest request) {
        return userAdminService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userAdminService.deleteUser(id);
    }

    @GetMapping("/access-logs")
    public List<AccessLogDto> getAccessLogs() {
        return userAdminService.getAccessLogs();
    }

    @PostMapping("/access-logs/entries")
    @ResponseStatus(HttpStatus.CREATED)
    public AccessLogDto createAccessLog(@Valid @RequestBody CreateAccessLogRequest request) {
        return userAdminService.createAccessLog(request);
    }

    @GetMapping("/teams")
    public List<TeamDto> getTeams() {
        return userAdminService.getTeams();
    }

    @PostMapping("/teams")
    @ResponseStatus(HttpStatus.CREATED)
    public TeamDto createTeam(@Valid @RequestBody CreateTeamRequest request) {
        return userAdminService.createTeam(request);
    }

    @DeleteMapping("/teams/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTeam(@PathVariable Long id) {
        userAdminService.deleteTeam(id);
    }
}
