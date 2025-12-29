package com.example.ecommerce.auth.service;

import com.example.ecommerce.auth.config.JwtProperties;
import com.example.ecommerce.auth.domain.AppUser;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final JwtEncoder jwtEncoder;
  private final JwtProperties props;

  public JwtService(JwtEncoder jwtEncoder, JwtProperties props) {
    this.jwtEncoder = jwtEncoder;
    this.props = props;
  }

  public String createAccessToken(AppUser user) {
    Instant now = Instant.now();
    Instant exp = now.plus(Duration.ofMinutes(props.getAccessTokenTtlMinutes()));

    JwtClaimsSet claims =
        JwtClaimsSet.builder()
            .issuer(props.getIssuer())
            .issuedAt(now)
            .expiresAt(exp)
            .subject(user.getEmail())
            .claim("uid", user.getId())
            .claim("roles", List.of(user.getRole().name()))
            .build();

    return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
  }

  public long accessTokenExpiresInSeconds() {
    return Duration.ofMinutes(props.getAccessTokenTtlMinutes()).toSeconds();
  }
}

