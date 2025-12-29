package com.example.ecommerce.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpsertProductRequest(
    @NotBlank @Size(max = 200) String name,
    @NotBlank @Size(max = 4000) String description,
    @NotNull @DecimalMin("0.00") BigDecimal price,
    @Min(0) int stockQty,
    @NotBlank @Size(max = 500) String imageUrl,
    boolean active
) {}

