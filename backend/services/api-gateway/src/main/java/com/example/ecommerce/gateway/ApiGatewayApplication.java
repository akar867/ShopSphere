package com.example.ecommerce.gateway;

import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;

@SpringBootApplication
public class ApiGatewayApplication {
  public static void main(String[] args) {
    SpringApplication.run(ApiGatewayApplication.class, args);
  }

@Bean
CorsConfigurationSource corsConfigurationSource() {
  CorsConfiguration config = new CorsConfiguration();

  config.setAllowedOrigins(List.of(
      "http://localhost:3000",
      "http://localhost:5173"
  ));

  config.setAllowedMethods(List.of(
      "GET", "POST", "PUT", "DELETE", "OPTIONS"
  ));

  config.setAllowedHeaders(List.of("*"));
  config.setAllowCredentials(true);

  UrlBasedCorsConfigurationSource source =
      new UrlBasedCorsConfigurationSource();

  source.registerCorsConfiguration("/**", config);
  return source;
	}
}

