package com.example.shadowdeploy.dto;

import com.example.shadowdeploy.domain.RunStatus;
import java.time.Instant;

public record ShadowRunResponse(
    long id,
    String serviceName,
    String environment,
    String versionSha,
    String baseVersionSha,
    RunStatus status,
    Instant startedAt,
    Instant completedAt,
    int requestCount,
    double errorRate,
    double latencyP95DeltaMs,
    int riskScore,
    int trafficSamplePercent,
    boolean mockWrites,
    String aiSummary
) {
}
