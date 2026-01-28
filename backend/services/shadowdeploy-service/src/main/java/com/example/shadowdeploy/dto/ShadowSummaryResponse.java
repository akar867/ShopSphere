package com.example.shadowdeploy.dto;

import java.util.List;

public record ShadowSummaryResponse(
    int totalRuns,
    int activeRuns,
    int highRiskRuns,
    double averageRiskScore,
    int totalFindings,
    List<FindingHighlightResponse> topFindings,
    List<ServiceRiskResponse> topServices
) {
}
