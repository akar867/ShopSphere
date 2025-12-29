package com.example.ecommerce.auth.repo;

import com.example.ecommerce.auth.domain.AppUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, Long> {
  Optional<AppUser> findByEmailIgnoreCase(String email);
  boolean existsByEmailIgnoreCase(String email);
}

