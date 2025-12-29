package com.example.ecommerce.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
    long id,
    long orderId,
    long userId,
    String provider,
    String status,
    BigDecimal amount,
    String currency,
    String providerPaymentId,
    String clientSecret,
    Instant createdAt,
    Instant updatedAt
) {}

