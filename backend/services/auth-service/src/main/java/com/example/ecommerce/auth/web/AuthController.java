package com.example.ecommerce.auth.web;

import com.example.ecommerce.auth.dto.AuthResponse;
import com.example.ecommerce.auth.dto.LoginRequest;
import com.example.ecommerce.auth.dto.MeResponse;
import com.example.ecommerce.auth.dto.RegisterRequest;
import com.example.ecommerce.auth.repo.UserRepository;
import com.example.ecommerce.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;
  private final UserRepository userRepository;

  public AuthController(AuthService authService, UserRepository userRepository) {
    this.authService = authService;
    this.userRepository = userRepository;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public void register(@Valid @RequestBody RegisterRequest req) {
    authService.register(req);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest req) {
	  try {
	        return authService.login(req);
	    } catch (Exception e) {
	        e.printStackTrace(); 
	        throw e; 
	    }
  }

  @GetMapping("/me")
  public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
    String email = jwt.getSubject();
    return userRepository
        .findByEmailIgnoreCase(email)
        .map(u -> new MeResponse(u.getId(), u.getEmail(), u.getRole().name()))
        .orElseGet(() -> new MeResponse(-1, email, "UNKNOWN"));
  }
}

