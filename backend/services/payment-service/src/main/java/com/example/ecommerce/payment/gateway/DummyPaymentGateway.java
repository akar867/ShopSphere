package com.example.ecommerce.payment.gateway;

import java.math.BigDecimal;
import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class DummyPaymentGateway implements PaymentGateway {
  private final SecureRandom random = new SecureRandom();

  @Override
  public String provider() {
    return "DUMMY";
  }

  @Override
  public CreateIntentResult createIntent(BigDecimal amount, String currency, long orderId) {
    // A real gateway would create a payment intent and return a client secret.
    return new CreateIntentResult("pi_" + randomHex(16), "secret_" + randomHex(24));
  }

  private String randomHex(int bytes) {
    byte[] b = new byte[bytes];
    random.nextBytes(b);
    StringBuilder sb = new StringBuilder(bytes * 2);
    for (byte x : b) {
      sb.append(String.format("%02x", x));
    }
    return sb.toString();
  }
}

