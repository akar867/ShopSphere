package com.example.ecommerce.payment.dto;

import jakarta.validation.constraints.Min;

public record CreatePaymentIntentRequest(
    @Min(1) long orderId,
    String provider
) {}

