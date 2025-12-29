package com.example.ecommerce.order.dto;

import jakarta.validation.constraints.Min;

public record CreateOrderItemRequest(
    long productId,
    @Min(1) int quantity
) {}

