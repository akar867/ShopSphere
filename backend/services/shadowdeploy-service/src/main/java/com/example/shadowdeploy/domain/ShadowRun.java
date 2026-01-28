package com.example.shadowdeploy.domain;

import java.time.Instant;

public record ShadowRun(
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
  public ShadowRun withId(long newId) {
    return new ShadowRun(
        newId,
        serviceName,
        environment,
        versionSha,
        baseVersionSha,
        status,
        startedAt,
        completedAt,
        requestCount,
        errorRate,
        latencyP95DeltaMs,
        riskScore,
        trafficSamplePercent,
        mockWrites,
        aiSummary
    );
  }
}
