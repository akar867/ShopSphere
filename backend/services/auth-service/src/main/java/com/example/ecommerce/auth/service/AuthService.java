package com.example.ecommerce.auth.service;

import com.example.ecommerce.auth.domain.AppUser;
import com.example.ecommerce.auth.domain.Role;
import com.example.ecommerce.auth.dto.AuthResponse;
import com.example.ecommerce.auth.dto.LoginRequest;
import com.example.ecommerce.auth.dto.RegisterRequest;
import com.example.ecommerce.auth.exception.BadRequestException;
import com.example.ecommerce.auth.exception.UnauthorizedException;
import com.example.ecommerce.auth.repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @Transactional
  public void register(RegisterRequest req) {
    if (userRepository.existsByEmailIgnoreCase(req.email())) {
      throw new BadRequestException("Email is already registered");
    }
    String hash = passwordEncoder.encode(req.password());
    userRepository.save(new AppUser(req.email().toLowerCase(), hash, Role.USER));
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest req) {
    AppUser user =
        userRepository
            .findByEmailIgnoreCase(req.email())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

    if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
      throw new UnauthorizedException("Invalid email or password");
    }

    String token = jwtService.createAccessToken(user);
    return new AuthResponse(token, "Bearer", jwtService.accessTokenExpiresInSeconds());
  }
}

