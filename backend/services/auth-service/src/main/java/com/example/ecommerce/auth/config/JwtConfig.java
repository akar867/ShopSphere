package com.example.ecommerce.auth.config;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtConfig {

  @Bean
  SecretKey jwtSecretKey(JwtProperties props) {
    byte[] bytes = props.getSecret().getBytes();
    return new SecretKeySpec(bytes, "HmacSHA256");
  }

  @Bean
  JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
    return NimbusJwtDecoder.withSecretKey(jwtSecretKey).macAlgorithm(MacAlgorithm.HS256).build();
  }

  @Bean
  JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
    // NimbusJwtEncoder wants a JWKSource; Spring provides a convenience for symmetric keys.
    return new NimbusJwtEncoder(new org.springframework.security.oauth2.jwt.ImmutableSecret<>(jwtSecretKey));
  }
}

