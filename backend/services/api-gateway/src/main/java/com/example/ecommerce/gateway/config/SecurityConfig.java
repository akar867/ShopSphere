package com.example.ecommerce.gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

@Configuration
@EnableReactiveMethodSecurity
public class SecurityConfig {

  @Bean
  SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
    return http
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .cors(Customizer.withDefaults())
        .authorizeExchange(ex -> ex
            .pathMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
            .pathMatchers("/actuator/**").permitAll()
            .pathMatchers("/api/auth/**").permitAll()
            .pathMatchers(HttpMethod.GET, "/api/products/**").permitAll()
            .pathMatchers("/api/shadowdeploy/**").permitAll()
            .anyExchange().authenticated()
        )
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
        .build();
  }

  @Bean
  ReactiveJwtDecoder reactiveJwtDecoder(@Value("${app.security.jwt.secret}") String secret) {
    SecretKey key = Keys.hmacShaKeyFor(io.jsonwebtoken.io.Decoders.BASE64.decode(secret));
    return token ->
        Mono.fromCallable(() -> decode(token, key))
            .onErrorMap(ex -> (ex instanceof JwtException) ? ex : new JwtException("Invalid JWT", ex));
  }

  private static Jwt decode(String token, SecretKey key) {
    try {
      Jws<Claims> jws = Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
      Claims claims = jws.getPayload();
      Map<String, Object> headers = jws.getHeader();
      Map<String, Object> claimMap = claims;

      Instant issuedAt = toInstant(claims.getIssuedAt());
      Instant expiresAt = toInstant(claims.getExpiration());

      return Jwt.withTokenValue(token)
          .headers(h -> h.putAll(headers))
          .claims(c -> c.putAll(claimMap))
          .issuedAt(issuedAt)
          .expiresAt(expiresAt)
          .build();
    } catch (SecurityException | IllegalArgumentException ex) {
      throw new JwtException("Invalid JWT", ex);
    } catch (Exception ex) {
      throw new JwtException("JWT decoding failed", ex);
    }
  }

  private static Instant toInstant(Date d) {
    return d == null ? null : d.toInstant();
  }
}

