package com.example.ecommerce.payment.gateway;

import com.example.ecommerce.payment.config.PaymentProperties;
import com.example.ecommerce.payment.exception.BadRequestException;
import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class StripePaymentGateway implements PaymentGateway {
  private final PaymentProperties props;

  public StripePaymentGateway(PaymentProperties props) {
    this.props = props;
  }

  @Override
  public String provider() {
    return "STRIPE";
  }

  @Override
  public CreateIntentResult createIntent(BigDecimal amount, String currency, long orderId) {
    String secretKey = props.getStripe().getSecretKey();
    if (secretKey == null || secretKey.isBlank()) {
      throw new BadRequestException("Stripe is not configured (missing STRIPE_SECRET_KEY)");
    }

    StripeClient client = new StripeClient(secretKey);

    try {
      // Stripe expects the smallest currency unit (e.g. cents).
      long amountMinor = toMinorUnits(amount);
      PaymentIntentCreateParams params =
          PaymentIntentCreateParams.builder()
              .setAmount(amountMinor)
              .setCurrency(currency.toLowerCase(Locale.ROOT))
              .putMetadata("orderId", String.valueOf(orderId))
              .setAutomaticPaymentMethods(
                  PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
              )
              .build();

      PaymentIntent intent = client.paymentIntents().create(params);
      return new CreateIntentResult(intent.getId(), intent.getClientSecret());
    } catch (StripeException ex) {
      throw new BadRequestException("Stripe error: " + ex.getMessage());
    }
  }

  private static long toMinorUnits(BigDecimal amount) {
    // For demo we assume 2-decimal currencies (USD, EUR, etc.)
    return amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
  }
}

