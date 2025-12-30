package com.example.ecommerce.auth.service;

import com.example.ecommerce.auth.config.JwtProperties;
import com.example.ecommerce.auth.domain.AppUser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;

@Service
public class JwtService {
  private final JwtProperties props;
  private final SecretKey jwtHmacKey;

  public JwtService(JwtProperties props, SecretKey jwtHmacKey) {
    this.props = props;
    this.jwtHmacKey = jwtHmacKey;
  }

  public String createAccessToken(AppUser user) {
    Instant now = Instant.now();
    Instant exp = now.plus(Duration.ofMinutes(props.getAccessTokenTtlMinutes()));

    return Jwts.builder()
        .setIssuer(props.getIssuer())
        .setSubject(user.getEmail())
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(exp))
        .claim("uid", user.getId())
        .claim("roles", List.of(user.getRole().name()))
        .signWith(jwtHmacKey, SignatureAlgorithm.HS256)
        .compact();
  }

  public long accessTokenExpiresInSeconds() {
    return Duration.ofMinutes(props.getAccessTokenTtlMinutes()).toSeconds();
  }
}

