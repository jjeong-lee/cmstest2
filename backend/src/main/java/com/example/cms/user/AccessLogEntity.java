package com.example.cms.user;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "access_logs")
public class AccessLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role;

    @Column(name = "accessed_at", nullable = false)
    private OffsetDateTime accessedAt;

    @PrePersist
    void onCreate() {
        if (accessedAt == null) {
            accessedAt = OffsetDateTime.now();
        }
    }

    public Long getId() { return id; }
    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public OffsetDateTime getAccessedAt() { return accessedAt; }
}
