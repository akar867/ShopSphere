package com.example.shadowdeploy.bootstrap;

import com.example.shadowdeploy.domain.DiffFinding;
import com.example.shadowdeploy.domain.DiffType;
import com.example.shadowdeploy.domain.FindingSeverity;
import com.example.shadowdeploy.domain.RunStatus;
import com.example.shadowdeploy.domain.ShadowRun;
import com.example.shadowdeploy.repo.DiffFindingRepository;
import com.example.shadowdeploy.repo.ShadowRunRepository;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.time.Instant;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {
  private final ShadowRunRepository runRepository;
  private final DiffFindingRepository findingRepository;

  public DataInitializer(ShadowRunRepository runRepository, DiffFindingRepository findingRepository) {
    this.runRepository = runRepository;
    this.findingRepository = findingRepository;
  }

  @PostConstruct
  public void seed() {
    Instant now = Instant.now();

    ShadowRun checkoutRun = runRepository.save(new ShadowRun(
        0,
        "checkout-service",
        "production",
        "2f9c1d1",
        "1a4c9e2",
        RunStatus.COMPLETED,
        now.minus(Duration.ofHours(3)),
        now.minus(Duration.ofHours(2)),
        15432,
        0.023,
        45.6,
        78,
        100,
        true,
        "2.3 percent of checkout requests fail due to null couponType handling."
    ));

    ShadowRun catalogRun = runRepository.save(new ShadowRun(
        0,
        "catalog-service",
        "production",
        "b7a91d0",
        "b7a90ff",
        RunStatus.COMPLETED,
        now.minus(Duration.ofHours(6)),
        now.minus(Duration.ofHours(5)),
        22410,
        0.004,
        12.4,
        22,
        50,
        true,
        "Catalog responses are stable with minor latency shift."
    ));

    ShadowRun authRun = runRepository.save(new ShadowRun(
        0,
        "auth-service",
        "staging",
        "9e21c11",
        "9e21bfe",
        RunStatus.RUNNING,
        now.minus(Duration.ofMinutes(45)),
        null,
        5200,
        0.0,
        5.2,
        12,
        100,
        true,
        "Shadow run is collecting auth traffic."
    ));

    ShadowRun paymentRun = runRepository.save(new ShadowRun(
        0,
        "payment-service",
        "production",
        "7c0b88a",
        "7c0b861",
        RunStatus.FAILED,
        now.minus(Duration.ofHours(2)),
        now.minus(Duration.ofMinutes(70)),
        8420,
        0.09,
        220.3,
        92,
        100,
        true,
        "Gateway timeouts and latency spikes detected in payment confirmation."
    ));

    findingRepository.save(new DiffFinding(
        0,
        checkoutRun.id(),
        DiffType.EXCEPTION,
        FindingSeverity.HIGH,
        "/api/checkout/apply-coupon",
        "Null couponType triggers DiscountService failure.",
        2.3,
        0.0,
        200,
        500,
        "couponType=FLASH",
        "Guard against null couponType before switching on enum values."
    ));

    findingRepository.save(new DiffFinding(
        0,
        checkoutRun.id(),
        DiffType.PAYLOAD,
        FindingSeverity.MEDIUM,
        "/api/checkout/quote",
        "Discount total rounding differs for 3-decimal tax rates.",
        1.1,
        0.0,
        200,
        200,
        "taxRate=0.085",
        "Align rounding strategy with baseline for monetary fields."
    ));

    findingRepository.save(new DiffFinding(
        0,
        catalogRun.id(),
        DiffType.LATENCY,
        FindingSeverity.LOW,
        "/api/products",
        "Median latency increases by 25ms during peak queries.",
        0.8,
        25.0,
        200,
        200,
        "q=wireless headphones",
        "Warm up cache or add an index for frequently searched terms."
    ));

    findingRepository.save(new DiffFinding(
        0,
        paymentRun.id(),
        DiffType.HTTP_STATUS,
        FindingSeverity.CRITICAL,
        "/api/payments/confirm",
        "Gateway timeout returns 504 instead of 200.",
        6.8,
        2300.0,
        200,
        504,
        "provider=STRIPE",
        "Add timeout handling and fallback for upstream gateway calls."
    ));

    findingRepository.save(new DiffFinding(
        0,
        paymentRun.id(),
        DiffType.LATENCY,
        FindingSeverity.HIGH,
        "/api/payments/intent",
        "p95 latency up by 620ms on intent creation.",
        4.1,
        620.0,
        200,
        200,
        "provider=STRIPE",
        "Batch remote calls and reuse TLS sessions to reduce latency."
    ));
  }
}
