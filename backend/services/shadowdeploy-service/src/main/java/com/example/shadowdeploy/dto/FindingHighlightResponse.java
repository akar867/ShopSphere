package com.example.shadowdeploy.dto;

import com.example.shadowdeploy.domain.DiffType;
import com.example.shadowdeploy.domain.FindingSeverity;

public record FindingHighlightResponse(
    long runId,
    String serviceName,
    DiffType type,
    FindingSeverity severity,
    String summary,
    double impactPercent
) {
}
