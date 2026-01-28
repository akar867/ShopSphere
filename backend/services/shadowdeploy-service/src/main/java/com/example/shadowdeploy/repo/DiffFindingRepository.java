package com.example.shadowdeploy.repo;

import com.example.shadowdeploy.domain.DiffFinding;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Repository;

@Repository
public class DiffFindingRepository {
  private final Map<Long, List<DiffFinding>> findingsByRun = new ConcurrentHashMap<>();
  private final AtomicLong idSequence = new AtomicLong(5000);

  public List<DiffFinding> findByRunId(long runId) {
    return findingsByRun.getOrDefault(runId, List.of());
  }

  public List<DiffFinding> findAll() {
    List<DiffFinding> all = new ArrayList<>();
    findingsByRun.values().forEach(all::addAll);
    return all;
  }

  public DiffFinding save(DiffFinding finding) {
    long id = finding.id() > 0 ? finding.id() : idSequence.incrementAndGet();
    DiffFinding saved = finding.id() == id ? finding : finding.withId(id);
    findingsByRun
        .computeIfAbsent(saved.runId(), key -> new CopyOnWriteArrayList<>())
        .add(saved);
    return saved;
  }
}
