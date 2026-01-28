package com.example.shadowdeploy.dto;

public record ServiceRiskResponse(
    String serviceName,
    int averageRiskScore,
    int runCount
) {
}
