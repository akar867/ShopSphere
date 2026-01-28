package com.example.shadowdeploy.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateShadowRunRequest(
    @NotBlank String serviceName,
    @NotBlank String environment,
    @NotBlank String versionSha,
    String baseVersionSha,
    @Min(1) @Max(100) int trafficSamplePercent,
    boolean mockWrites
) {
}
