package com.example.ecommerce.auth.config;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtKeyConfig {

  @Bean
  SecretKey jwtHmacKey(JwtProperties props) {
    // Accept either raw text or base64; base64 is recommended.
    String secret = props.getSecret();
    byte[] keyBytes;
    try {
      keyBytes = Decoders.BASE64.decode(secret);
    } catch (IllegalArgumentException ex) {
      keyBytes = secret.getBytes();
    }
    return Keys.hmacShaKeyFor(keyBytes);
  }
}

