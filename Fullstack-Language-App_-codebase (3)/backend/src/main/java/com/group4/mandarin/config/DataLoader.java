package com.group4.mandarin.config;

import com.group4.mandarin.model.User;
import com.group4.mandarin.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initUsers(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            if (!users.existsByEmail("admin@mandarin.app")) {
                User admin = new User();
                admin.setEmail("admin@mandarin.app");
                admin.setPasswordHash(encoder.encode("admin123"));
                admin.setRole("ADMIN");
                users.save(admin);
            }
        };
    }
}