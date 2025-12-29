package com.example.ecommerce.payment.client;

import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class OrderClient {
  private final RestClient restClient;

  public OrderClient(@Value("${app.clients.order-service.base-url:http://localhost:8083}") String baseUrl) {
    this.restClient = RestClient.builder().baseUrl(baseUrl).build();
  }

  public OrderSnapshot getOrder(long orderId, String authorizationHeader) {
    try {
      return restClient
          .get()
          .uri("/api/orders/{id}", orderId)
          .header("Authorization", authorizationHeader)
          .retrieve()
          .body(OrderSnapshot.class);
    } catch (RestClientResponseException ex) {
      HttpStatusCode status = HttpStatusCode.valueOf(ex.getStatusCode().value());
      throw new OrderClientException("Order service error (" + status + "): " + ex.getResponseBodyAsString(), ex);
    }
  }

  public record OrderSnapshot(
      long id,
      long userId,
      String status,
      BigDecimal totalAmount,
      String currency
  ) {}

  public static class OrderClientException extends RuntimeException {
    public OrderClientException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}

