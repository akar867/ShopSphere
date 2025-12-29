package com.example.ecommerce.payment.gateway;

import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class PaymentGatewayRegistry {
  private final List<PaymentGateway> gateways;

  public PaymentGatewayRegistry(List<PaymentGateway> gateways) {
    this.gateways = gateways;
  }

  public PaymentGateway require(String provider) {
    String p = provider.trim().toUpperCase(Locale.ROOT);
    return gateways.stream()
        .filter(g -> g.provider().equalsIgnoreCase(p))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("Unsupported payment provider: " + provider));
  }
}

