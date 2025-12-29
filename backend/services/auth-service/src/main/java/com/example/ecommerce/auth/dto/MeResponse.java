package com.example.ecommerce.auth.dto;

public record MeResponse(
    long id,
    String email,
    String role
) {}

