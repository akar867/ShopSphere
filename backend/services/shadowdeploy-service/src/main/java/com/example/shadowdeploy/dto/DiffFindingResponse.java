package com.example.shadowdeploy.dto;

import com.example.shadowdeploy.domain.DiffType;
import com.example.shadowdeploy.domain.FindingSeverity;

public record DiffFindingResponse(
    long id,
    long runId,
    DiffType type,
    FindingSeverity severity,
    String endpoint,
    String summary,
    double impactPercent,
    double latencyDeltaMs,
    Integer baselineStatus,
    Integer shadowStatus,
    String example,
    String aiExplanation
) {
}
