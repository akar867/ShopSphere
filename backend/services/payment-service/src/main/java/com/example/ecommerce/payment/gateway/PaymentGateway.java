package com.example.ecommerce.payment.gateway;

import java.math.BigDecimal;

public interface PaymentGateway {
  String provider();

  CreateIntentResult createIntent(BigDecimal amount, String currency, long orderId);

  record CreateIntentResult(String providerPaymentId, String clientSecret) {}
}

