package com.example.ecommerce.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.payment")
public class PaymentProperties {
  /**
   * Default provider when frontend doesn't specify.
   * Supported: DUMMY, STRIPE
   */
  private String defaultProvider = "DUMMY";

  private Stripe stripe = new Stripe();

  public String getDefaultProvider() {
    return defaultProvider;
  }

  public void setDefaultProvider(String defaultProvider) {
    this.defaultProvider = defaultProvider;
  }

  public Stripe getStripe() {
    return stripe;
  }

  public void setStripe(Stripe stripe) {
    this.stripe = stripe;
  }

  public static class Stripe {
    /**
     * Stripe secret key (starts with sk_...). Set via env STRIPE_SECRET_KEY.
     */
    private String secretKey;

    /**
     * Optional: Stripe webhook signing secret (whsec_...).
     */
    private String webhookSecret;

    public String getSecretKey() {
      return secretKey;
    }

    public void setSecretKey(String secretKey) {
      this.secretKey = secretKey;
    }

    public String getWebhookSecret() {
      return webhookSecret;
    }

    public void setWebhookSecret(String webhookSecret) {
      this.webhookSecret = webhookSecret;
    }
  }
}

