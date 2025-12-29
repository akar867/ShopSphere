package com.example.ecommerce.product.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
    long id,
    String name,
    String description,
    BigDecimal price,
    int stockQty,
    String imageUrl,
    boolean active,
    Instant createdAt
) {}

