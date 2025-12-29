package com.example.ecommerce.order.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
    long id,
    long productId,
    String productName,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal lineTotal
) {}

