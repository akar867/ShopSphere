package com.example.ecommerce.order.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.SecurityException;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

public class JjwtJwtDecoder implements JwtDecoder {
  private final SecretKey key;

  public JjwtJwtDecoder(SecretKey key) {
    this.key = key;
  }

  @Override
  public Jwt decode(String token) throws JwtException {
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

