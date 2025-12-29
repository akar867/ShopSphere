package com.example.ecommerce.product.api;

import java.time.Instant;
import java.util.List;

public record ApiError(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    String traceId,
    List<FieldViolation> fieldViolations
) {
  public record FieldViolation(String field, String message) {}
}

