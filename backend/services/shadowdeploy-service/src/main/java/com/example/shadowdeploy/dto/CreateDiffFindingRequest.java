package com.example.shadowdeploy.dto;

import com.example.shadowdeploy.domain.DiffType;
import com.example.shadowdeploy.domain.FindingSeverity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateDiffFindingRequest(
    @NotNull DiffType type,
    @NotNull FindingSeverity severity,
    @NotBlank String endpoint,
    @NotBlank String summary,
    @Min(0) @Max(100) double impactPercent,
    @Min(0) double latencyDeltaMs,
    Integer baselineStatus,
    Integer shadowStatus,
    String example,
    String aiExplanation
) {
}
