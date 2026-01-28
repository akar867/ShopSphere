package com.example.shadowdeploy.web;

import com.example.shadowdeploy.domain.RunStatus;
import com.example.shadowdeploy.dto.CreateDiffFindingRequest;
import com.example.shadowdeploy.dto.CreateShadowRunRequest;
import com.example.shadowdeploy.dto.DiffFindingResponse;
import com.example.shadowdeploy.dto.ShadowRunResponse;
import com.example.shadowdeploy.dto.ShadowSummaryResponse;
import com.example.shadowdeploy.exception.BadRequestException;
import com.example.shadowdeploy.service.ShadowDeployService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shadowdeploy")
public class ShadowDeployController {
  private final ShadowDeployService shadowDeployService;

  public ShadowDeployController(ShadowDeployService shadowDeployService) {
    this.shadowDeployService = shadowDeployService;
  }

  @GetMapping("/summary")
  public ShadowSummaryResponse summary() {
    return shadowDeployService.getSummary();
  }

  @GetMapping("/runs")
  public List<ShadowRunResponse> listRuns(
      @RequestParam(required = false) String status,
      @RequestParam(required = false) Integer limit
  ) {
    Optional<RunStatus> statusFilter = Optional.empty();
    if (status != null && !status.isBlank()) {
      try {
        statusFilter = Optional.of(RunStatus.valueOf(status.trim().toUpperCase()));
      } catch (IllegalArgumentException ex) {
        throw new BadRequestException("Unknown status: " + status);
      }
    }
    return shadowDeployService.listRuns(statusFilter, limit);
  }

  @PostMapping("/runs")
  @ResponseStatus(HttpStatus.CREATED)
  public ShadowRunResponse createRun(@Valid @RequestBody CreateShadowRunRequest request) {
    return shadowDeployService.createRun(request);
  }

  @GetMapping("/runs/{id}")
  public ShadowRunResponse getRun(@PathVariable long id) {
    return shadowDeployService.getRun(id);
  }

  @GetMapping("/runs/{id}/diffs")
  public List<DiffFindingResponse> listFindings(@PathVariable long id) {
    return shadowDeployService.listFindings(id);
  }

  @PostMapping("/runs/{id}/diffs")
  @ResponseStatus(HttpStatus.CREATED)
  public DiffFindingResponse addFinding(
      @PathVariable long id,
      @Valid @RequestBody CreateDiffFindingRequest request
  ) {
    return shadowDeployService.addFinding(id, request);
  }
}
