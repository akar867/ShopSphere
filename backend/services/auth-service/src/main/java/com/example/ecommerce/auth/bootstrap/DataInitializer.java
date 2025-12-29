package com.example.ecommerce.auth.bootstrap;

import com.example.ecommerce.auth.domain.AppUser;
import com.example.ecommerce.auth.domain.Role;
import com.example.ecommerce.auth.repo.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

  /**
   * Demo users:
   * - admin@example.com / Admin@123 (role ADMIN)
   * - user@example.com / User@1234 (role USER)
   */
  @Bean
  ApplicationRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    return args -> {
      seed(userRepository, passwordEncoder, "admin@example.com", "Admin@123", Role.ADMIN);
      seed(userRepository, passwordEncoder, "user@example.com", "User@1234", Role.USER);
    };
  }

  private static void seed(
      UserRepository userRepository,
      PasswordEncoder encoder,
      String email,
      String rawPassword,
      Role role
  ) {
    if (userRepository.existsByEmailIgnoreCase(email)) {
      return;
    }
    userRepository.save(new AppUser(email, encoder.encode(rawPassword), role));
  }
}

