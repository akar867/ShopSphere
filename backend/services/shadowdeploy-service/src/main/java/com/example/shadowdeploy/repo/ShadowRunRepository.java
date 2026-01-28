package com.example.shadowdeploy.repo;

import com.example.shadowdeploy.domain.ShadowRun;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Repository;

@Repository
public class ShadowRunRepository {
  private final Map<Long, ShadowRun> runs = new ConcurrentHashMap<>();
  private final AtomicLong idSequence = new AtomicLong(1000);

  public List<ShadowRun> findAll() {
    List<ShadowRun> all = new ArrayList<>(runs.values());
    all.sort(Comparator.comparing(ShadowRun::startedAt).reversed());
    return all;
  }

  public Optional<ShadowRun> findById(long id) {
    return Optional.ofNullable(runs.get(id));
  }

  public ShadowRun save(ShadowRun run) {
    long id = run.id() > 0 ? run.id() : idSequence.incrementAndGet();
    ShadowRun saved = run.id() == id ? run : run.withId(id);
    runs.put(id, saved);
    return saved;
  }
}
