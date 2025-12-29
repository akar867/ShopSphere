package com.example.ecommerce.order.client;

import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class ProductClient {
  private final RestClient restClient;

  public ProductClient(@Value("${app.clients.product-service.base-url:http://localhost:8082}") String baseUrl) {
    this.restClient = RestClient.builder().baseUrl(baseUrl).build();
  }

  public ProductSnapshot getProduct(long productId) {
    try {
      return restClient.get().uri("/api/products/{id}", productId).retrieve().body(ProductSnapshot.class);
    } catch (RestClientResponseException ex) {
      HttpStatusCode status = HttpStatusCode.valueOf(ex.getStatusCode().value());
      throw new ProductClientException("Product service error (" + status + "): " + ex.getResponseBodyAsString(), ex);
    }
  }

  public record ProductSnapshot(
      long id,
      String name,
      String description,
      BigDecimal price,
      int stockQty,
      String imageUrl,
      boolean active
  ) {}

  public static class ProductClientException extends RuntimeException {
    public ProductClientException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}

