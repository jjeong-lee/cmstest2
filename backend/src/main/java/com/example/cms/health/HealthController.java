package com.example.cms.health;

import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Integer dbCheck = jdbcTemplate.queryForObject("select 1", Integer.class);
        return Map.of(
                "status", "UP",
                "service", "cms-backend",
                "database", dbCheck != null && dbCheck == 1 ? "UP" : "DOWN"
        );
    }
}
