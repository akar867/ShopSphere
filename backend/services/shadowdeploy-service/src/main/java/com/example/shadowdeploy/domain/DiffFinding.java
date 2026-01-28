package com.example.shadowdeploy.domain;

public record DiffFinding(
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
  public DiffFinding withId(long newId) {
    return new DiffFinding(
        newId,
        runId,
        type,
        severity,
        endpoint,
        summary,
        impactPercent,
        latencyDeltaMs,
        baselineStatus,
        shadowStatus,
        example,
        aiExplanation
    );
  }
}
