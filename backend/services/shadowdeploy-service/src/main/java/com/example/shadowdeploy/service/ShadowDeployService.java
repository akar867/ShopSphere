package com.example.shadowdeploy.service;

import com.example.shadowdeploy.domain.DiffFinding;
import com.example.shadowdeploy.domain.FindingSeverity;
import com.example.shadowdeploy.domain.RunStatus;
import com.example.shadowdeploy.domain.ShadowRun;
import com.example.shadowdeploy.dto.CreateDiffFindingRequest;
import com.example.shadowdeploy.dto.CreateShadowRunRequest;
import com.example.shadowdeploy.dto.DiffFindingResponse;
import com.example.shadowdeploy.dto.FindingHighlightResponse;
import com.example.shadowdeploy.dto.ServiceRiskResponse;
import com.example.shadowdeploy.dto.ShadowRunResponse;
import com.example.shadowdeploy.dto.ShadowSummaryResponse;
import com.example.shadowdeploy.exception.NotFoundException;
import com.example.shadowdeploy.repo.DiffFindingRepository;
import com.example.shadowdeploy.repo.ShadowRunRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ShadowDeployService {
  private static final int HIGH_RISK_THRESHOLD = 75;

  private final ShadowRunRepository runRepository;
  private final DiffFindingRepository findingRepository;

  public ShadowDeployService(
      ShadowRunRepository runRepository,
      DiffFindingRepository findingRepository
  ) {
    this.runRepository = runRepository;
    this.findingRepository = findingRepository;
  }

  public List<ShadowRunResponse> listRuns(Optional<RunStatus> statusFilter, Integer limit) {
    List<ShadowRun> runs = runRepository.findAll();
    if (statusFilter.isPresent()) {
      runs = runs.stream()
          .filter(run -> run.status() == statusFilter.get())
          .toList();
    }
    if (limit != null && limit > 0 && runs.size() > limit) {
      runs = runs.subList(0, limit);
    }
    return runs.stream().map(ShadowDeployService::toResponse).toList();
  }

  public ShadowRunResponse getRun(long id) {
    ShadowRun run = runRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Shadow run not found"));
    return toResponse(run);
  }

  public ShadowRunResponse createRun(CreateShadowRunRequest request) {
    ShadowRun run = new ShadowRun(
        0,
        request.serviceName(),
        request.environment(),
        request.versionSha(),
        request.baseVersionSha(),
        RunStatus.RUNNING,
        Instant.now(),
        null,
        0,
        0.0,
        0.0,
        0,
        request.trafficSamplePercent(),
        request.mockWrites(),
        "Shadow run started. Waiting for comparison results."
    );
    return toResponse(runRepository.save(run));
  }

  public List<DiffFindingResponse> listFindings(long runId) {
    ensureRunExists(runId);
    return findingRepository.findByRunId(runId).stream()
        .map(ShadowDeployService::toResponse)
        .toList();
  }

  public DiffFindingResponse addFinding(long runId, CreateDiffFindingRequest request) {
    ensureRunExists(runId);
    DiffFinding finding = new DiffFinding(
        0,
        runId,
        request.type(),
        request.severity(),
        request.endpoint(),
        request.summary(),
        request.impactPercent(),
        request.latencyDeltaMs(),
        request.baselineStatus(),
        request.shadowStatus(),
        request.example(),
        request.aiExplanation()
    );
    return toResponse(findingRepository.save(finding));
  }

  public ShadowSummaryResponse getSummary() {
    List<ShadowRun> runs = runRepository.findAll();
    List<DiffFinding> findings = findingRepository.findAll();

    int totalRuns = runs.size();
    int activeRuns = (int) runs.stream()
        .filter(run -> run.status() == RunStatus.RUNNING || run.status() == RunStatus.PENDING)
        .count();
    int highRiskRuns = (int) runs.stream()
        .filter(run -> run.riskScore() >= HIGH_RISK_THRESHOLD)
        .count();
    double avgRisk = runs.isEmpty()
        ? 0.0
        : runs.stream().mapToInt(ShadowRun::riskScore).average().orElse(0.0);
    int totalFindings = findings.size();

    Map<Long, ShadowRun> runById = runs.stream()
        .collect(Collectors.toMap(ShadowRun::id, run -> run));

    List<FindingHighlightResponse> topFindings = findings.stream()
        .sorted(Comparator
            .comparingInt((DiffFinding finding) -> severityWeight(finding.severity()))
            .reversed()
            .thenComparing(DiffFinding::impactPercent, Comparator.reverseOrder()))
        .limit(3)
        .map(finding -> {
          ShadowRun run = runById.get(finding.runId());
          String serviceName = run != null ? run.serviceName() : "unknown-service";
          return new FindingHighlightResponse(
              finding.runId(),
              serviceName,
              finding.type(),
              finding.severity(),
              finding.summary(),
              finding.impactPercent()
          );
        })
        .toList();

    List<ServiceRiskResponse> topServices = runs.stream()
        .collect(Collectors.groupingBy(ShadowRun::serviceName))
        .entrySet()
        .stream()
        .map(entry -> {
          int averageRisk = (int) Math.round(
              entry.getValue().stream().mapToInt(ShadowRun::riskScore).average().orElse(0.0)
          );
          return new ServiceRiskResponse(entry.getKey(), averageRisk, entry.getValue().size());
        })
        .sorted(Comparator.comparingInt(ServiceRiskResponse::averageRiskScore).reversed())
        .limit(5)
        .toList();

    return new ShadowSummaryResponse(
        totalRuns,
        activeRuns,
        highRiskRuns,
        avgRisk,
        totalFindings,
        topFindings,
        topServices
    );
  }

  private void ensureRunExists(long runId) {
    if (runRepository.findById(runId).isEmpty()) {
      throw new NotFoundException("Shadow run not found");
    }
  }

  private static ShadowRunResponse toResponse(ShadowRun run) {
    return new ShadowRunResponse(
        run.id(),
        run.serviceName(),
        run.environment(),
        run.versionSha(),
        run.baseVersionSha(),
        run.status(),
        run.startedAt(),
        run.completedAt(),
        run.requestCount(),
        run.errorRate(),
        run.latencyP95DeltaMs(),
        run.riskScore(),
        run.trafficSamplePercent(),
        run.mockWrites(),
        run.aiSummary()
    );
  }

  private static DiffFindingResponse toResponse(DiffFinding finding) {
    return new DiffFindingResponse(
        finding.id(),
        finding.runId(),
        finding.type(),
        finding.severity(),
        finding.endpoint(),
        finding.summary(),
        finding.impactPercent(),
        finding.latencyDeltaMs(),
        finding.baselineStatus(),
        finding.shadowStatus(),
        finding.example(),
        finding.aiExplanation()
    );
  }

  private static int severityWeight(FindingSeverity severity) {
    return switch (severity) {
      case CRITICAL -> 4;
      case HIGH -> 3;
      case MEDIUM -> 2;
      case LOW -> 1;
    };
  }
}
